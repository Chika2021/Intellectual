// src/certificates/certificates.service.ts
import { Injectable, NotFoundException, ForbiddenException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as puppeteer from 'puppeteer';
import { CourseCompletion } from './models/course-completion.model';
import { User } from '../user/model/user.model';
import { Course } from '../courses/models/course.model';

@Injectable()
export class CertificateService {
  private readonly logger = new Logger(CertificateService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads', 'certificates');

  constructor(
    @InjectRepository(CourseCompletion)
    private completionRepo: Repository<CourseCompletion>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async generateAndSaveCertificate(userId: number, courseId: number): Promise<CourseCompletion> {
    const existing = await this.completionRepo.findOne({
      where: { student: { id: userId }, course: { id: courseId } },
    });

    if (existing?.certificateUrl) {
      const fileName = existing.certificateUrl.split('/').pop()!;
      if (existsSync(join(this.uploadDir, fileName))) return existing;
    }

    const [student, course] = await Promise.all([
      this.userRepo.findOne({ where: { id: userId } }),
      this.courseRepo.findOne({ where: { id: courseId }, relations: ['user'] }),
    ]);
    if (!student || !course) throw new NotFoundException('User or course not found');

    const fileName = `cert_${userId}_${courseId}_${Date.now()}.pdf`;
    const filePath = join(this.uploadDir, fileName);

    await this.generateCertificatePdf(filePath, student, course);

    const completion = existing
      ? Object.assign(existing, { certificateUrl: `/api/certificates/download/${fileName}` })
      : this.completionRepo.create({
          student,
          course,
          certificateUrl: `/api/certificates/download/${fileName}`,
        });

    return this.completionRepo.save(completion);
  }

  async getCompletion(userId: number, courseId: number) {
    return this.completionRepo.findOne({
      where: { student: { id: userId }, course: { id: courseId } },
    });
  }

  async getCertificateFile(filename: string, userId: number): Promise<string> {
    const match = filename.match(/^cert_(\d+)_(\d+)_/);
    if (!match || parseInt(match[1]) !== userId) {
      throw new ForbiddenException('You do not own this certificate');
    }

    let filePath = join(this.uploadDir, filename);
    if (!existsSync(filePath)) {
      // BUG FIX: regeneration creates a brand-new file with a fresh
      // Date.now()-based name, so re-derive filePath from the completion
      // record's (possibly updated) certificateUrl instead of re-checking
      // the stale filename that was passed in.
      const courseId = parseInt(match[2]);
      const completion = await this.generateAndSaveCertificate(userId, courseId);
      if (completion?.certificateUrl) {
        const regeneratedFileName = completion.certificateUrl.split('/').pop()!;
        filePath = join(this.uploadDir, regeneratedFileName);
      }
    }
    if (!existsSync(filePath)) throw new NotFoundException('Certificate not found');
    return filePath;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HTML → PDF generation using Puppeteer
  // ──────────────────────────────────────────────────────────────────────────
  private async generateCertificatePdf(filePath: string, student: User, course: Course): Promise<void> {
    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // BUG FIX: Render/Docker-style containers give Chrome a tiny (64MB)
          // /dev/shm, which crashes headless Chrome on launch or mid-render.
          // This forces Chrome to use /tmp instead, which is the standard
          // fix for "Failed to launch the browser process" on hosts like Render.
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
        ],
      });

      const page = await browser.newPage();
      const html = this.buildCertificateHtml(student, course);
      await page.setContent(html, { waitUntil: 'load' });
      await page.pdf({
        path: filePath,
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    } catch (error: any) {
      // BUG FIX: log the full error (not just .message) so the real Puppeteer
      // failure (missing Chromium, OOM kill, sandbox error, etc.) is visible
      // in Render's logs instead of being hidden behind a generic message.
      this.logger.error(`Failed to generate PDF: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException(
        process.env.NODE_ENV === 'production'
          ? 'Certificate generation failed'
          : `Certificate generation failed: ${error?.message}`,
      );
    } finally {
      if (browser) await browser.close();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Premium HTML → PDF certificate design
  // ──────────────────────────────────────────────────────────────────────────
  private buildCertificateHtml(student: User, course: Course): string {
    const date = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const certId = `CERT-${String(student.id).padStart(4, '0')}-${String(course.id).padStart(4, '0')}`;
    const instructorName = (course as any).user?.name ?? 'Course Instructor';

    const cornerSvg = `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <path d="M4 4 L60 4" stroke="#b7944a" stroke-width="2"/>
        <path d="M4 4 L4 60" stroke="#b7944a" stroke-width="2"/>
        <path d="M4 4 L22 22" stroke="#b7944a" stroke-width="1" stroke-dasharray="2 3" opacity="0.7"/>
        <circle cx="22" cy="22" r="4" fill="#b7944a"/>
        <circle cx="4"  cy="4"  r="4" fill="#1a3c8f"/>
        <circle cx="60" cy="4"  r="2.5" fill="#b7944a" opacity="0.4"/>
        <circle cx="4"  cy="60" r="2.5" fill="#b7944a" opacity="0.4"/>
        <path d="M14 4 L4 14" stroke="#b7944a" stroke-width="0.8" opacity="0.5"/>
      </svg>`;

    const sealStar = `
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
        <polygon points="20,3 23.5,14 35,14 25.8,21 29,32 20,25 11,32 14.2,21 5,14 16.5,14"
                 fill="none" stroke="#b7944a" stroke-width="1.3" stroke-linejoin="round"/>
        <circle cx="20" cy="20" r="5" fill="#b7944a" opacity="0.15"/>
        <circle cx="20" cy="20" r="2" fill="#b7944a"/>
      </svg>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate of Completion</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }

          @page { size: A4 landscape; margin: 0; }

          body {
            width: 297mm;
            height: 210mm;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Georgia', 'Times New Roman', Times, serif;
          }

          .certificate {
            width: 297mm;
            height: 210mm;
            background: #ffffff;
            position: relative;
            overflow: hidden;
            page-break-after: avoid;
            break-inside: avoid;
          }

          .bg-glow {
            position: absolute;
            inset: 0;
            background:
              radial-gradient(ellipse 55% 55% at 15% 90%, rgba(183,148,74,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 55% 55% at 85% 10%, rgba(26,60,143,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 40% 40% at 50% 50%, rgba(183,148,74,0.04) 0%, transparent 70%);
          }

          .watermark {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
          }
          .watermark-letter {
            font-size: 340px;
            font-weight: bold;
            color: #1a3c8f;
            opacity: 0.028;
            line-height: 1;
            user-select: none;
          }

          .border-navy      { position: absolute; inset: 14px; border: 9px solid #1a3c8f; }
          .border-gold      { position: absolute; inset: 25px; border: 1.5px solid #b7944a; }
          .border-gold-inner{ position: absolute; inset: 31px; border: 0.5px solid rgba(183,148,74,0.35); }

          .corner       { position: absolute; width: 64px; height: 64px; }
          .corner-tl    { top: 16px; left: 16px; }
          .corner-tr    { top: 16px; right: 16px; transform: scaleX(-1); }
          .corner-bl    { bottom: 16px; left: 16px; transform: scaleY(-1); }
          .corner-br    { bottom: 16px; right: 16px; transform: scale(-1,-1); }

          .content {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 42px 80px 36px;
          }

          .emblem { display: flex; flex-direction: column; align-items: center; margin-bottom: 10px; }
          .emblem-ring {
            width: 56px; height: 56px;
            border: 2.5px solid #b7944a; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            position: relative; margin-bottom: 7px;
          }
          .emblem-ring::before {
            content: ''; position: absolute; inset: 4px;
            border: 1px solid rgba(183,148,74,0.45); border-radius: 50%;
          }
          .emblem-initial { font-family: 'Georgia', serif; font-size: 26px; font-weight: bold; color: #1a3c8f; line-height: 1; }
          .brand-text { font-size: 10px; letter-spacing: 6px; color: #1a3c8f; font-weight: bold; text-transform: uppercase; }

          .divider        { display: flex; align-items: center; gap: 9px; margin: 8px 0; }
          .divider.wide   { width: 400px; }
          .divider.narrow { width: 260px; }
          .divider-line   { flex: 1; height: 1px; background: linear-gradient(to right, transparent, #b7944a 40%, #b7944a 60%, transparent); }
          .divider-diamond{ width: 7px; height: 7px; background: #b7944a; transform: rotate(45deg); flex-shrink: 0; }

          .cert-title { font-size: 58px; font-weight: bold; letter-spacing: 12px; color: #1a3c8f; text-transform: uppercase; line-height: 1; margin-bottom: 3px; }
          .cert-of    { font-size: 11px; letter-spacing: 7px; color: #b7944a; text-transform: uppercase; }

          .presented-label { font-size: 11px; color: #9ca3af; letter-spacing: 3px; text-transform: uppercase; margin-top: 10px; margin-bottom: 5px; }

          .student-name {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 50px; font-style: italic; color: #0f172a;
            line-height: 1; text-align: center; margin-bottom: 5px;
          }
          .name-rule {
            width: 340px; height: 2px;
            background: linear-gradient(to right, transparent, #1a3c8f 25%, #b7944a 50%, #1a3c8f 75%, transparent);
            margin-bottom: 9px;
          }

          .for-label     { font-size: 10px; color: #9ca3af; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 4px; }
          .course-name   { font-size: 17px; font-weight: bold; color: #1a3c8f; text-align: center; max-width: 580px; line-height: 1.4; margin-bottom: 6px; }
          .completion-body { font-size: 10.5px; color: #9ca3af; text-align: center; max-width: 500px; line-height: 1.7; }

          .footer { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; margin-top: 14px; }

          .sig-block   { text-align: center; width: 200px; }
          .sig-italic  { font-family: 'Georgia', serif; font-style: italic; font-size: 16px; color: #1a3c8f; display: block; }
          .sig-rule    { width: 150px; height: 1px; background: linear-gradient(to right, transparent, #1a3c8f, transparent); margin: 6px auto 6px; }
          .sig-name    { font-size: 12px; font-weight: bold; color: #0f172a; }
          .sig-title   { font-size: 9.5px; color: #9ca3af; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

          .seal-block  { display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .seal-ring   {
            width: 72px; height: 72px;
            border: 3px solid #b7944a; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            position: relative;
          }
          .seal-ring::before {
            content: ''; position: absolute; inset: 5px;
            border: 1px dashed rgba(183,148,74,0.55); border-radius: 50%;
          }
          .seal-date     { font-size: 9.5px; color: #9ca3af; letter-spacing: 1px; text-align: center; }
          .cert-id-label { font-size: 8.5px; color: #d1d5db; letter-spacing: 1px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="bg-glow"></div>

          <div class="watermark">
            <span class="watermark-letter">R</span>
          </div>

          <div class="border-navy"></div>
          <div class="border-gold"></div>
          <div class="border-gold-inner"></div>

          <div class="corner corner-tl">${cornerSvg}</div>
          <div class="corner corner-tr">${cornerSvg}</div>
          <div class="corner corner-bl">${cornerSvg}</div>
          <div class="corner corner-br">${cornerSvg}</div>

          <div class="content">

            <div class="emblem">
              <div class="emblem-ring">
                <span class="emblem-initial">R</span>
              </div>
              <span class="brand-text">Robernix &nbsp;·&nbsp; Industries</span>
            </div>

            <div class="divider wide">
              <div class="divider-line"></div>
              <div class="divider-diamond"></div>
              <div class="divider-line"></div>
            </div>

            <div class="cert-title">Certificate</div>
            <div class="cert-of">of &nbsp; completion</div>

            <div class="divider narrow">
              <div class="divider-line"></div>
              <div class="divider-diamond"></div>
              <div class="divider-line"></div>
            </div>

            <p class="presented-label">This certificate is proudly presented to</p>

            <p class="student-name">${escapeHtml(student.name)}</p>
            <div class="name-rule"></div>

            <p class="for-label">for successfully completing</p>
            <p class="course-name">&ldquo;${escapeHtml(course.name)}&rdquo;</p>
            <p class="completion-body">
              In recognition of exceptional dedication, perseverance, and outstanding achievement in
              professional development and lifelong learning.
            </p>

            <div class="footer">
              <div class="sig-block">
                <span class="sig-italic">Robernix Industries</span>
                <div class="sig-rule"></div>
                <p class="sig-name">Robernix Industries</p>
                <p class="sig-title">Chief Executive Officer</p>
              </div>

              <div class="seal-block">
                <div class="seal-ring">${sealStar}</div>
                <p class="seal-date">${escapeHtml(date)}</p>
                <p class="cert-id-label">${escapeHtml(certId)}</p>
              </div>

              <div class="sig-block">
                <span class="sig-italic">${escapeHtml(instructorName)}</span>
                <div class="sig-rule"></div>
                <p class="sig-name">${escapeHtml(instructorName)}</p>
                <p class="sig-title">Course Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Helper to escape HTML special characters
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
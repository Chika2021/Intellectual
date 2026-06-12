// src/certificates/certificates.controller.ts
import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CertificateService } from './certificates.service';

@Controller('api/certificates')
export class CertificateController {
  constructor(private certService: CertificateService) {}

  // BUG FIX: was calling getCompletion() which only queries — never generates.
  // First-time call always returned null so the frontend had no URL to download.
  // Now calls generateAndSaveCertificate() which creates the PDF if it doesn't exist,
  // then returns the download URL.
  @UseGuards(AuthGuard('jwt'))
  @Get('my-completion/:courseId')
  async getMyCompletion(@Param('courseId') courseId: string, @Req() req) {
    const completion = await this.certService.generateAndSaveCertificate(req.user.id, +courseId);
    return { certificateUrl: completion?.certificateUrl || null };
  }

  // BUG FIX: added explicit Content-Type and Content-Disposition headers so the
  // browser always triggers a real file download instead of trying to navigate to the PDF.
  @UseGuards(AuthGuard('jwt'))
  @Get('download/:filename')
  async download(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const filePath = await this.certService.getCertificateFile(filename, req.user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.download(filePath, filename);
  }
}
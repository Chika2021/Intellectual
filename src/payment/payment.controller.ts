import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './models/payment.dto';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Step 1 — Buyer hits this to get a Paystack checkout URL.
   * Frontend redirects user to `authorization_url`.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('initiate')
  async initiatePayment(
    @Body() dto: InitiatePaymentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.paymentService.initiatePayment(dto, userId);
  }

  /**
   * Step 2a — Paystack calls this after a successful charge.
   * IMPORTANT: This endpoint must be registered as a webhook URL
   * in your Paystack Dashboard → Settings → Webhooks.
   * It must be publicly accessible (no auth guard).
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    if (!req || !req.rawBody) {
      throw new BadRequestException('Missing webhook body');
    }

    return this.paymentService.handleWebhook(req.rawBody as Buffer, signature);
  }

  /**
   * Step 2b — Manual verification called from the frontend after Paystack redirect.
   * No auth guard — the reference IS the proof of payment.
   * The frontend sends the JWT anyway, but we don't require it here so the
   * verify call never returns 401 even if the token hasn't loaded yet.
   */
  @Get('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }

  /**
   * Returns all courses the logged-in user has paid for.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('my-courses')
  async getMyEnrollments(@Req() req) {
    return this.paymentService.getMyEnrollments(req.user.id);
  }
}
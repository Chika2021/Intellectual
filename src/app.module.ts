import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/model/user.model';
import { ConfigModule } from '@nestjs/config';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/models/course.model';
import { LecturesModule } from './lectures/lectures.module';
import { Lectures } from './lectures/model/lectures.model';
import { PaymentModule } from './payment/payment.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { CertificateModule } from './certificates/certificates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'lms',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    CoursesModule,
    LecturesModule,
    PaymentModule,
    AdminModule,
    SeedModule,
    CertificateModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

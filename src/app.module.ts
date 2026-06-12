// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { UserModule } from './user/user.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './user/model/user.model';
// import { ConfigModule } from '@nestjs/config';
// import { CoursesModule } from './courses/courses.module';
// import { Course } from './courses/models/course.model';
// import { LecturesModule } from './lectures/lectures.module';
// import { Lectures } from './lectures/model/lectures.model';
// import { PaymentModule } from './payment/payment.module';
// import { AdminModule } from './admin/admin.module';
// import { SeedModule } from './seed/seed.module';
// import { CertificateModule } from './certificates/certificates.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true
//     }),
//     TypeOrmModule.forRoot({
//       type: 'mysql',
//       host: 'localhost',
//       port: 3306,
//       username: 'root',
//       password: '',
//       database: 'lms',
//       autoLoadEntities: true,
//       synchronize: true,
//     }),
//     UserModule,
//     CoursesModule,
//     LecturesModule,
//     PaymentModule,
//     AdminModule,
//     SeedModule,
//     CertificateModule,


//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}



import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/model/user.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/models/course.model';
import { LecturesModule } from './lectures/lectures.module';
import { Lectures } from './lectures/model/lectures.model';
import { PaymentModule } from './payment/payment.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { CertificateModule } from './certificates/certificates.module';
import { Enrollment } from './payment/models/enrollment.model';
import { LectureProgress } from './lectures/model/lecture-progress.model';
import { CourseCompletion } from './certificates/models/course-completion.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'aws-0-eu-west-1.pooler.supabase.com',
        port: 6543,
        username: 'postgres.nadvtcgfwnlzjszsbwvj',
        password: 'chikaamaechi',
        database: 'postgres',
        ssl: {
          rejectUnauthorized: false,
        },
        entities: [User, Course, Lectures, Enrollment, LectureProgress, CourseCompletion],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
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
import { Module } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lectures } from './model/lectures.model';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/user/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/model/user.model';
import { UserModule } from 'src/user/user.module';
import { Course } from 'src/courses/models/course.model';
import { CertificateModule } from 'src/certificates/certificates.module';
import { LectureProgress } from './model/lecture-progress.model';

@Module({
  imports:[
    
    PassportModule.register({defaultStrategy: 'jwt'}),
    
    TypeOrmModule.forFeature([Lectures,  Course, LectureProgress]),

    JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService:ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: '1h'
            }
        }),
    }),
    UserModule,
    CertificateModule, 
  ],
  providers: [LecturesService, JwtStrategy],
  controllers: [LecturesController],
  exports: [PassportModule, JwtStrategy]
})
export class LecturesModule {
  
}

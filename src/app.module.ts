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
      entities: [ User , Course , Lectures],
      synchronize: true,
    }),
    ConfigModule.forRoot(),
    UserModule,
    CoursesModule,
    LecturesModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

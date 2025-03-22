import type { InstrsName, CMDInfo } from './tester.config';

import { exec } from 'child_process';
import path from 'path';

import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import PQueue from 'p-queue';

import testerConfig from './tester.config';

/**
 * @example
 * const tester = new Tester("test_program");
 * const stdout = await tester.exec("input");
 */
abstract class Tester {
  program: InstrsName;
  cmdInfo: CMDInfo;
  mainDirPath: string;
  tmpDirPath: string;
  queue: PQueue;

  abstract inFilesPath: string[];
  abstract outFilesPath: string[];

  constructor(program: InstrsName) {
    this.program = program;
    this.cmdInfo = testerConfig.cmd[this.program];
    this.mainDirPath = path.resolve(
      testerConfig.basic.path,
      this.cmdInfo.dir,
      'main'
    );
    this.tmpDirPath = path.resolve(
      testerConfig.basic.path,
      this.cmdInfo.dir,
      'tmp'
    );
    this.queue = new PQueue({ concurrency: 1 });

    if (!this.cmdInfo) {
      throw new Error(`Invalid program name: ${program}`);
    }

    // clean tmp dir
    fs.emptyDirSync(this.tmpDirPath);
  }

  abstract __setInputFilesContent(
    name: string,
    input: string,
    baseDirPath: string
  ): void;

  exec(inputs: { name: string; input: string }[]): Promise<{
    uuid: string;
    stdout: string;
    outputFiles?: { name: string; content: string }[];
  }> {
    return new Promise((resolve, reject) => {
      const uuid = uuidv4();

      // 写入临时文件夹
      const uuidTempDirPath = path.resolve(this.tmpDirPath, uuid);

      try {
        for (const { name, input } of inputs) {
          this.__setInputFilesContent(name, input, uuidTempDirPath);
        }
      } catch (error) {
        return reject(error);
      }

      this.queue
        .add(() => this.processJob(uuid))
        .then((result) => {
          if (result === void 0) {
            return reject(new Error('No result'));
          }
          resolve(result);
        })
        .catch(reject);
    });
  }

  private processJob(uuid: string): Promise<{
    uuid: string;
    stdout: string;
    outputFiles?: { name: string; content: string }[];
  }> {
    // 把临时文件夹中的文件放入主文件夹
    for (const name of this.inFilesPath) {
      fs.copyFileSync(
        path.resolve(this.tmpDirPath, uuid, name),
        path.resolve(this.mainDirPath, name)
      );
      fs.unlinkSync(path.resolve(this.tmpDirPath, uuid, name));
    }

    return new Promise<{
      uuid: string;
      stdout: string;
      outputFiles?: { name: string; content: string }[];
    }>((resolve, reject) => {
      exec(
        this.cmdInfo.instr,
        { cwd: this.mainDirPath },
        (error, stdout, stderr) => {
          if (error) {
            return reject(new Error(error.message));
          }
          if (stderr) {
            return reject(new Error(stderr));
          }

          try {
            // 将主文件夹中的输出文件放入临时文件夹
            for (const name of this.outFilesPath) {
              fs.copyFileSync(
                path.resolve(this.mainDirPath, name),
                path.resolve(this.tmpDirPath, uuid, name)
              );
              fs.unlinkSync(path.resolve(this.mainDirPath, name));
            }
          } catch (error) {
            return reject(error);
          }

          const outputFiles = this.outFilesPath.map((name) => ({
            name,
            content: fs.readFileSync(
              path.resolve(this.tmpDirPath, uuid, name),
              'utf-8'
            ),
          }));

          // 删除临时文件夹
          fs.removeSync(path.resolve(this.tmpDirPath, uuid));

          resolve({
            uuid,
            stdout,
            outputFiles,
          });
        }
      );
    });
  }
}

export { Tester };

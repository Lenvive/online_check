import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  UserGetClientBody,
  UserGetServerBody,
  UserPostClientBody,
  UserPostServerBody,
} from '@/utils/tester.config';

import path from 'path';

import fs from 'fs-extra';
import { createRouter } from 'next-connect';

import { Tester } from '@/utils/Tester';

const apiRoute = createRouter<NextApiRequest, NextApiResponse>();

class TestProgramTester extends Tester {
  inFilesPath = ['test/in/input.s'];
  outFilesPath = [
    'test/out/input.log',
    'test/out/input.out',
    'test/out/input.memcheck',
  ];

  __setInputFilesContent(
    name: string,
    input: string,
    baseDirPath: string
  ): void {
    if (name === 'input.s') {
      fs.outputFileSync(path.resolve(baseDirPath, 'test/in/input.s'), input);
    }
  }
}

const tester = new TestProgramTester('cs110P_prj1');

apiRoute.post((req, res) => {
  const { inputs } = req.body as UserPostClientBody;

  tester
    .exec(inputs)
    .then(({ uuid, stdout, outputFiles }) => {
      // 删去outputFiles中的路径前缀 projDirPath
      outputFiles = outputFiles?.map((outputFile) => ({
        content: outputFile.content,
        name: '.' + outputFile.name.replace(tester.mainDirPath, ''),
      }));

      const serverBody: UserPostServerBody = {
        uuid: uuid,
        stdout: stdout,
        outputFiles: outputFiles ?? [],
      };

      res.status(200).json(serverBody);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

apiRoute.get((req, res) => {
  const { projName } = req.query as UserGetClientBody;

  if (projName === tester.program) {
    const serverBody: UserGetServerBody = {
      cmdInfo: tester.cmdInfo,
    };

    res.status(200).json(serverBody);
  } else {
    res.status(404).json({ error: 'cmdName not found' });
  }
});

export default apiRoute.handler();

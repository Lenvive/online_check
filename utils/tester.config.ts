import path from 'path';
import { fileURLToPath } from 'url';

export type UserPostClientBody = {
  inputs: [
    {
      name: string;
      input: string;
    },
  ];
};

export type UserGetClientBody = {
  projName: string;
};

export type UserPostServerBody = {
  stdout: string;
  outputFiles: { name: string; content: string }[];
  uuid: string;
};

export type UserGetServerBody = {
  cmdInfo: {
    dir: string;
    instr: string;
    inputNames: string[];
    outputNames: string[];
  };
};

export type CMDInfo = {
  dir: string;
  instr: string;
  inputNames: string[];
  outputNames: string[];
};

export type TesterConfig = {
  basic: {
    path: string;
  };
  cmd: Record<string, CMDInfo>;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type InstrsName = 'example' | 'cs110P_prj1' | 'cs110P_hw3';

const testerConfig: TesterConfig = {
  basic: {
    path: path.resolve(__dirname, '../dist/program'),
  },
  cmd: {
    example: {
      dir: 'test_program',
      instr: 'node ./test.js',
      inputNames: ['main'],
      outputNames: ['log'],
    },
    cs110P_prj1: {
      dir: 'cs110P_prj1',
      instr: 'make check',
      inputNames: ['input.s'],
      outputNames: ['.log', '.out', '.memcheck'],
    },
    cs110P_hw3: {
      dir: 'cs110P_hw3',
      instr:
        'rm ./out.txt ; ./build/bin/leaderboard_cli < ./test/leaderboard_in.txt > ./out.txt',
      inputNames: ['./test/leaderboard_in.txt'],
      outputNames: ['./out.txt'],
    },
  },
};

export default testerConfig;

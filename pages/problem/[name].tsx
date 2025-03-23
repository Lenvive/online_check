'use client';

import type {
  UserGetServerBody,
  UserPostClientBody,
  UserPostServerBody,
  UserGetClientBody,
} from '@/utils/tester.config.ts';

import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Textarea } from '@heroui/input';
import { Button } from '@heroui/button';
import { Code } from '@heroui/code';
import { Divider } from '@heroui/divider';
import { HeroUIProvider } from '@heroui/system';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function Home() {
  const [inputNames, setInputNames] = useState(['']);
  const [outputNames, setOutputNames] = useState(['']);
  const [inputs, setInputs] = useState<{ name: string; input: string }[]>([]);
  const [cmd, setCmd] = useState('');
  const [dirName, setDirName] = useState('');
  const [stdout, setStdout] = useState('');
  const [outputFiles, setOutputFiles] = useState<
    {
      name: string;
      content: string;
    }[]
  >([{ name: '', content: '' }]);
  const [uuid, setUuid] = useState('');

  const router = useRouter();
  const { name: projName } = router.query;

  useEffect(() => {
    if (!projName) {
      return;
    }
    axios
      .get<UserGetServerBody>(`/api/${projName}`, {
        params: { projName },
      })
      .then((data) => {
        const { cmdInfo } = data.data;

        setDirName(cmdInfo.dir);
        setInputNames(cmdInfo.inputNames);
        setOutputNames(cmdInfo.outputNames);
        setOutputFiles(
          cmdInfo.outputNames.map((name) => ({ name, content: '' }))
        );
        setCmd(cmdInfo.instr);
      })
      .catch(() => {
        router.push('/404');
      });
  }, [projName]);

  return (
    <HeroUIProvider>
      <NextThemesProvider attribute={'class'} defaultTheme="dark">
        <div className="relative flex flex-col">
          <main className="container mx-auto max-w-7xl pt-16 pb-16 px-6 flex-grow">
            <div>
              <h1 className="mb-4 font-bold text-2xl">{projName}</h1>
              <h2 className="mb-4 font-normal text-xl">Dir: {dirName}</h2>
              <h2 className="mb-4 font-normal text-xl font-mono">
                <Code>{cmd}</Code>
              </h2>
              <h2 className="mb-4 font-normal text-sm">{uuid}</h2>
              <div>
                {inputNames.map((name) => (
                  <Textarea
                    key={name}
                    className="mb-4 font-mono"
                    label={name}
                    minRows={7}
                    onChange={(e) => {
                      const value = e.target.value;

                      setInputs((prev) => {
                        const index = prev.findIndex(
                          (input) => input.name === name
                        );

                        if (index === -1) {
                          return [...prev, { name, input: value }];
                        }

                        prev[index].input = value;

                        return prev;
                      });
                    }}
                  />
                ))}
              </div>
              <Button
                className="mb-4"
                onPress={() => {
                  axios
                    .post<UserPostServerBody>(`/api/${projName}`, { inputs })
                    .then((data) => {
                      const { stdout, outputFiles, uuid } = data.data;

                      setStdout(stdout);
                      setOutputFiles(outputFiles);
                      setUuid(uuid);
                    });
                }}
              >
                Run
              </Button>
              <Textarea
                disabled
                className="mb-4 font-mono"
                label="Stdout"
                minRows={7}
                value={stdout}
              />
              <Divider className="my-4" />
              <div>
                {outputFiles.map((outputFile, index) => (
                  <div key={outputFile.name}>
                    <Textarea
                      disabled
                      className="mb-4 font-mono"
                      label={outputNames[index]}
                      minRows={7}
                      value={outputFile.content}
                    />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

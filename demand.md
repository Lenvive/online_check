# online_check

## prototype

### program

- `config`: 运行指令[]
- `inputs`: 用户上传的输入文件
- `outputs`: 程序运行后的生成的输出文件
- `stdout`: 程序运行的标准输出

## function list

### Client

1. 上传输入文件
2. 等待服务器操作
3. 下载输出文件

### Server

1. 接收输入文件
2. 运行程序
3. 上传输出文件
4. 10分钟后删除输入输出文件

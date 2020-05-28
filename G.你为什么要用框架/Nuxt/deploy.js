const fs = require('fs')
const ora = require('ora')
const NodeSSh = require('node-ssh')

const archiver = require('archiver')
const { join } = require('path')
const { exec } = require('child_process')

const inquirer = require('inquirer')
const chalk = require('chalk')
const boxen = require('boxen')

const figlet = require('figlet')

const ARCHIVE_NAME = 'dist.zip'

// 测试环境配置
const SSH_TEST_CONFIG = {
  hostList: [
    {
      host: '',
      port: 22,
      user: 'feng',
      password: 'weiphone',
      name: '测试服务器'
    }
  ],
  remotePath: '/front-end',
  scripts: [
    `unzip -o ${ARCHIVE_NAME} -d new-feng-pc/`,
    'pm2 delete feng-pc-render-server',
    `cd /front-end/new-feng-pc && pm2 start pm2.json`,
    'pm2 restart feng-pc-render-server',
    `rm -rf ${ARCHIVE_NAME}`
  ]
}

// 正式环境配置
const SSH_RELEASE_CONFIG = {
  hostList: [
    {
      host: '',
      port: 58422,
      user: 'root',
      password: 'VDJK32d2&AN7',
      name: '正式服务器1'
    },
    {
      host: '',
      port: 58422,
      user: 'root',
      password: 'VDJK32d2&AN7',
      name: '正式服务器2'
    },
    {
      host: '',
      port: 58422,
      user: 'root',
      password: 'VDJK32d2&AN7',
      name: '正式服务器3'
    }
  ],
  remotePath: '/front-end',
  scripts: ['']
}

// 打包的文件或文件夹
const FILES = [
  '.nuxt',
  'nuxt.config.js',
  'package.json',
  'middleware',
  'server',
  'pm2.json',
  'serverMiddleware'
]

const PROMPT_LIST = [
  {
    type: 'list',
    name: 'env',
    message: '请选择需要部署的环境？',
    choices: ['测试环境', '正式环境'],
    filter(val) {
      return (
        {
          测试环境: 'test',
          正式环境: 'release'
        }[val] || 'test'
      )
    },
    default: 0
  },
  {
    type: 'confirm',
    message: '确定部署至 正式环境 ？',
    name: 'confirm',
    prefix: '警告',
    when(answers) {
      return answers.env === 'release'
    }
  }
]

function isDirectory(path) {
  return fs.lstatSync(path).isDirectory()
}

function deleteFile(path) {
  fs.unlinkSync(path)
}

function printLogo() {
  console.log(
    boxen(
      chalk.white(
        figlet.textSync('WEI PHONE', {
          font: 'ANSI Shadow',
          horizontalLayout: 'default',
          verticalLayout: 'default'
        })
      ),
      { padding: 1 }
    )
  )
}

// 编译
function buildNuxt() {
  return new Promise((resolve) => {
    const spinner = ora('正在编译中，请稍后...')
    spinner.start()
    exec('npm run build', (error) => {
      if (error) throw error
      spinner.succeed('编译成功')
      resolve()
    })
  })
}

// 打包
function startZip() {
  const spinner = ora('正在打包，请稍后...')
  spinner.start()

  return new Promise((resolve) => {
    const output = fs
      .createWriteStream(__dirname + `/${ARCHIVE_NAME}`)
      .on('close', () => {
        spinner.succeed(`打包完成，总计 ${archive.pointer()} bytes`)
        resolve()
      })

    const archive = archiver('zip', {
      zlib: { level: 9 }
    }).on('error', function(err) {
      throw err
    })

    archive.pipe(output)

    FILES.forEach((path) => {
      if (isDirectory(path)) archive.directory(path)
      else archive.file(path)
    })

    archive.finalize()
  })
}

// 上传
function uploadFiles(env) {
  const sshConfig =
    {
      test: SSH_TEST_CONFIG,
      release: SSH_RELEASE_CONFIG
    }[env] || SSH_TEST_CONFIG

  sshConfig.hostList.forEach(async (host) => {
    const ssh = new NodeSSh()

    const spinner = ora(`正在连接服务器 ${host.host} ...`)
    spinner.start()

    await ssh.connect(host)
    spinner.succeed(`连接服务器 ${host.host} 成功`)

    const spinner1 = ora(`正在上传至服务器${host.host}...`)
    spinner1.start()

    const filePath = join(__dirname, ARCHIVE_NAME)
    await ssh.putFile(filePath, `${sshConfig.remotePath}/${ARCHIVE_NAME}`)
    spinner1.succeed(`上传至服务器 ${host.host} 成功`)

    const spinner2 = ora(`正在部署服务器 ${host.host}...`)
    spinner2.start()

    let promises = []

    // 执行脚本
    for (let i = 0, len = sshConfig.scripts.length; i < len; i++) {
      const command = sshConfig.scripts[i]
      promises.push(runCommand(command, sshConfig.remotePath, ssh))
    }

    Promise.all(promises).then(() => {
      spinner2.succeed(`部署至服务器 ${host.host} 成功`)
      deleteFile(join(__dirname, ARCHIVE_NAME))
      process.exit(0)
    })
  })
}

function runCommand(command, path, ssh) {
  return new Promise((resolve, reject) => {
    ssh
      .execCommand(command, { cwd: path })
      .then(() => {
        resolve()
      })
      .catch((error) => {
        reject(error)
      })
  })
}

// 起步
async function start() {
  printLogo()
  if (process.env.NODE_ENV === 'development') {
    await buildNuxt()
    await startZip()
    uploadFiles('test')
  }
  if (process.env.NODE_ENV === 'production') {
    await buildNuxt()
    await startZip()
    uploadFiles('release')
  }
  inquirer.prompt(PROMPT_LIST).then(async (answers) => {
    if (answers.env === 'release' && !answers.confirm) return
    await buildNuxt()
    await startZip()
    uploadFiles(answers.env)
  })
}

start()

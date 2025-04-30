#!/usr/bin/env node

import { promises as fs } from 'fs';
import { execSync } from 'child_process';

// 颜色定义
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

// 打印带颜色的信息
const log = {
  info: (msg) => console.log(`${colors.green}INFO: ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}WARN: ${msg}${colors.reset}`),
  error: (msg) => {
    console.error(`${colors.red}ERROR: ${msg}${colors.reset}`);
    process.exit(1);
  }
};

// 检查工作目录是否干净
function checkGitStatus() {
  try {
    const status = execSync('git status -s', { encoding: 'utf8' });
    if (status.trim()) {
      log.error('工作目录不干净，请先提交或暂存更改');
    }
  } catch (err) {
    log.error(`Git 操作失败: ${err.message}`);
  }
}

// 获取当前版本号
async function getCurrentVersion() {
  try {
    const packageJson = await fs.readFile('package.json', 'utf8');
    const { version } = JSON.parse(packageJson);
    return version;
  } catch (err) {
    log.error(`读取 package.json 失败: ${err.message}`);
  }
}

// 更新版本号
function updateVersion(currentVersion, versionType) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (versionType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      log.error('无效的版本类型: ' + versionType + '，请使用 major, minor 或 patch');
  }
}

// 更新 package.json 中的版本号
async function updatePackageJson(newVersion) {
  try {
    const packageJson = await fs.readFile('package.json', 'utf8');
    const pkg = JSON.parse(packageJson);
    pkg.version = newVersion;
    await fs.writeFile('package.json', JSON.stringify(pkg, null, 2) + '\n');
  } catch (err) {
    log.error(`更新 package.json 失败: ${err.message}`);
  }
}

// 生成自上次tag以来的变更日志
function generateChangelog(newVersion) {
  try {
    let lastTag = '';
    try {
      lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      log.info(`从上一个tag ${lastTag} 生成变更日志`);
    } catch {
      log.warn('没有找到之前的tag，将包含所有提交');
    }

    const date = new Date().toISOString().split('T')[0];
    let changelogContent = `## ${newVersion} (${date})\n\n`;

    // 获取提交信息并分类
    const commits = lastTag
      ? execSync(`git log --pretty=format:"%s" ${lastTag}..HEAD`, { encoding: 'utf8' })
      : execSync('git log --pretty=format:"%s"', { encoding: 'utf8' });

    const { features, fixes, others } = commits
      .split('\n')
      .filter(Boolean)
      .reduce((acc, commit) => {
        if (commit.startsWith('feat') || commit.startsWith('feature')) {
          acc.features.push(`- ${commit.replace(/^feat(ure)?:\s*/, '')}`);
        } else if (commit.startsWith('fix')) {
          acc.fixes.push(`- ${commit.replace(/^fix:\s*/, '')}`);
        } else {
          acc.others.push(`- ${commit}`);
        }
        return acc;
      }, { features: [], fixes: [], others: [] });

    // 添加分类的提交到变更日志
    if (features.length) {
      changelogContent += `### 新特性\n\n${features.join('\n')}\n\n`;
    }
    if (fixes.length) {
      changelogContent += `### 修复\n\n${fixes.join('\n')}\n\n`;
    }
    if (others.length) {
      changelogContent += `### 其他\n\n${others.join('\n')}\n\n`;
    }

    return changelogContent;
  } catch (err) {
    log.error(`生成变更日志失败: ${err.message}`);
  }
}

// 更新 CHANGELOG.md 文件
async function updateChangelog(newVersion, changelogContent) {
  try {
    let existingContent = '';
    try {
      existingContent = await fs.readFile('CHANGELOG.md', 'utf8');
    } catch {
      existingContent = '# 更新日志\n';
      log.info('创建了新的 CHANGELOG.md 文件');
    }

    await fs.writeFile('CHANGELOG.md', `${changelogContent}${existingContent}`);
    log.info('更新了 CHANGELOG.md 文件');
  } catch (err) {
    log.error(`更新 CHANGELOG.md 失败: ${err.message}`);
  }
}

// 主函数
// 交互式选择版本类型
async function selectVersionType() {
  const options = [
    { value: 'major', label: 'major - 主版本号' },
    { value: 'minor', label: 'minor - 次版本号' },
    { value: 'patch', label: 'patch - 补丁版本号' }
  ];
  let selectedIndex = 2; // 将初始索引设置为2，对应patch版本

  // 配置原始模式以便我们可以直接读取按键
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  const renderOptions = () => {
    // 清除控制台上一次的输出
    console.clear();
    console.log('请使用上下键选择要发布的版本类型，按回车确认:\n');
    
    options.forEach((option, index) => {
      const prefix = index === selectedIndex ? '> ' : '  ';
      console.log(`${prefix}${option.label}`);
    });
  };

  return new Promise((resolve) => {
    renderOptions();

    process.stdin.on('data', (key) => {
      const keyCode = key.toString();

      if (keyCode === '\u001B[A' && selectedIndex > 0) { // 上键
        selectedIndex--;
        renderOptions();
      } else if (keyCode === '\u001B[B' && selectedIndex < options.length - 1) { // 下键
        selectedIndex++;
        renderOptions();
      } else if (keyCode === '\r') { // 回车键
        process.stdin.setRawMode(false);
        process.stdin.pause();
        console.clear();
        resolve(options[selectedIndex].value);
      } else if (keyCode === '\u0003') { // Ctrl+C
        process.exit();
      }
    });
  });
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');

    if (isDryRun) {
      log.info('运行在预览模式');
    }

    const versionType = await selectVersionType();

    if (isDryRun) {
      log.info('运行在预览模式');
    }

    // 检查git状态
    checkGitStatus();

    // 获取当前版本并计算新版本
    const currentVersion = await getCurrentVersion();
    const newVersion = updateVersion(currentVersion, versionType);

    log.info(`当前版本: ${currentVersion}`);
    log.info(`新版本: ${newVersion}`);

    // 生成变更日志内容
    const changelogContent = generateChangelog(newVersion);

    // 预览模式下只显示信息，不实际修改
    if (isDryRun) {
      console.log('\n预览变更日志内容:\n');
      console.log(changelogContent);
      log.info('预览模式结束，未进行实际更改');
      return;
    }

    // 更新 package.json 中的版本号
    await updatePackageJson(newVersion);

    // 更新 CHANGELOG.md
    await updateChangelog(newVersion, changelogContent);

    // 提交更改
    execSync('git add package.json CHANGELOG.md');
    execSync(`git commit -m "chore: 发布 v${newVersion}"`);

    // 创建新的tag
    execSync(`git tag -a "v${newVersion}" -m "版本 ${newVersion}"`);

    log.info(`成功创建版本 v${newVersion}`);
    log.info("请运行 'git push && git push --tags' 来推送更改");
  } catch (err) {
    log.error(`发布过程中出错: ${err.message}`);
  }
}

// 执行主函数
main();
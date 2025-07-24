import { Command } from 'commander';
import { logger } from '../utils/logger';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

interface ProjectStatus {
  project: {
    name: string;
    version: string;
    directory: string;
    size: string;
  };
  git: {
    branch: string;
    status: string;
    commits: number;
    remote: string;
    hasUncommitted: boolean;
  };
  config: {
    exists: boolean;
    valid: boolean;
    path: string;
  };
  dependencies: {
    total: number;
    outdated: number;
    vulnerabilities: number;
  };
  files: {
    total: number;
    typescript: number;
    javascript: number;
    tests: number;
  };
}

async function getProjectInfo(): Promise<ProjectStatus['project']> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let projectInfo = {
    name: '알 수 없음',
    version: '알 수 없음',
    directory: process.cwd(),
    size: '알 수 없음'
  };

  try {
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      projectInfo.name = packageJson.name || '알 수 없음';
      projectInfo.version = packageJson.version || '알 수 없음';
    }

    // 프로젝트 크기 계산
    const stats = await getDirectorySize(process.cwd());
    projectInfo.size = formatBytes(stats);
  } catch (error) {
    logger.debug('프로젝트 정보 수집 중 오류:', error);
  }

  return projectInfo;
}

async function getGitInfo(): Promise<ProjectStatus['git']> {
  let gitInfo = {
    branch: '알 수 없음',
    status: '알 수 없음',
    commits: 0,
    remote: '알 수 없음',
    hasUncommitted: false
  };

  try {
    // Git 저장소인지 확인
    if (!await fs.pathExists(path.join(process.cwd(), '.git'))) {
      gitInfo.status = 'Git 저장소 아님';
      return gitInfo;
    }

    // 현재 브랜치
    gitInfo.branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();

    // Git 상태
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    gitInfo.hasUncommitted = status.length > 0;
    gitInfo.status = gitInfo.hasUncommitted ? '변경사항 있음' : '깨끗함';

    // 커밋 수
    try {
      const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' });
      gitInfo.commits = parseInt(commitCount.trim(), 10);
    } catch {
      gitInfo.commits = 0;
    }

    // 원격 저장소
    try {
      gitInfo.remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    } catch {
      gitInfo.remote = '설정되지 않음';
    }
  } catch (error) {
    logger.debug('Git 정보 수집 중 오류:', error);
  }

  return gitInfo;
}

async function getConfigInfo(): Promise<ProjectStatus['config']> {
  const configPaths = [
    path.join(process.cwd(), '.dooray-ai', 'config.json'),
    path.join(require('os').homedir(), '.dooray-ai', 'config.json')
  ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(configPath)) {
      try {
        await fs.readJson(configPath);
        return {
          exists: true,
          valid: true,
          path: configPath
        };
      } catch {
        return {
          exists: true,
          valid: false,
          path: configPath
        };
      }
    }
  }

  return {
    exists: false,
    valid: false,
    path: '없음'
  };
}

async function getDependencyInfo(): Promise<ProjectStatus['dependencies']> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let depInfo = {
    total: 0,
    outdated: 0,
    vulnerabilities: 0
  };

  try {
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};
      depInfo.total = Object.keys(deps).length + Object.keys(devDeps).length;

      // 취약점 확인 (npm audit)
      try {
        const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
        const audit = JSON.parse(auditResult);
        depInfo.vulnerabilities = audit.metadata?.vulnerabilities?.total || 0;
      } catch {
        // npm audit 실패 시 0으로 설정
      }

      // 오래된 패키지 확인 (npm outdated)
      try {
        execSync('npm outdated --json', { encoding: 'utf8' });
      } catch (error: any) {
        if (error.stdout) {
          const outdated = JSON.parse(error.stdout);
          depInfo.outdated = Object.keys(outdated).length;
        }
      }
    }
  } catch (error) {
    logger.debug('종속성 정보 수집 중 오류:', error);
  }

  return depInfo;
}

async function getFileInfo(): Promise<ProjectStatus['files']> {
  let fileInfo = {
    total: 0,
    typescript: 0,
    javascript: 0,
    tests: 0
  };

  try {
    const files = await getAllFiles(process.cwd());
    fileInfo.total = files.length;

    for (const file of files) {
      const ext = path.extname(file);
      if (ext === '.ts') fileInfo.typescript++;
      else if (ext === '.js') fileInfo.javascript++;
      
      if (file.includes('.test.') || file.includes('.spec.') || file.includes('test/')) {
        fileInfo.tests++;
      }
    }
  } catch (error) {
    logger.debug('파일 정보 수집 중 오류:', error);
  }

  return fileInfo;
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory() && !shouldIgnoreDir(item)) {
      const subFiles = await getAllFiles(fullPath);
      files.push(...subFiles);
    } else if (stat.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function shouldIgnoreDir(name: string): boolean {
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'];
  return ignoreDirs.includes(name);
}

async function getDirectorySize(dirPath: string): Promise<number> {
  let size = 0;
  const items = await fs.readdir(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory() && !shouldIgnoreDir(item)) {
      size += await getDirectorySize(fullPath);
    } else if (stat.isFile()) {
      size += stat.size;
    }
  }

  return size;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStatusIcon(status: boolean | string): string {
  if (typeof status === 'boolean') {
    return status ? '✅' : '❌';
  }
  return status === '깨끗함' ? '✅' : '⚠️';
}

export const statusCommand = new Command('status')
  .description('프로젝트 상태 확인')
  .option('-v, --verbose', '상세 정보 표시')
  .option('-j, --json', 'JSON 형식으로 출력')
  .action(async (options) => {
    try {
      logger.info('프로젝트 상태를 확인하고 있습니다...');

      const [project, git, config, dependencies, files] = await Promise.all([
        getProjectInfo(),
        getGitInfo(),
        getConfigInfo(),
        getDependencyInfo(),
        getFileInfo()
      ]);

      const status: ProjectStatus = {
        project,
        git,
        config,
        dependencies,
        files
      };

      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
        return;
      }

      // 콘솔 출력
      console.log('\n📊 Dooray AI 프로젝트 상태 보고서\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 프로젝트 정보
      console.log('📁 프로젝트 정보');
      console.log(`   이름: ${project.name}`);
      console.log(`   버전: ${project.version}`);
      console.log(`   디렉토리: ${project.directory}`);
      console.log(`   크기: ${project.size}\n`);

      // Git 정보
      console.log('🌿 Git 상태');
      console.log(`   브랜치: ${git.branch}`);
      console.log(`   상태: ${getStatusIcon(git.status)} ${git.status}`);
      console.log(`   커밋 수: ${git.commits}`);
      console.log(`   원격 저장소: ${git.remote}`);
      if (options.verbose && git.hasUncommitted) {
        console.log(`   ⚠️  커밋되지 않은 변경사항이 있습니다.`);
      }
      console.log('');

      // 설정 정보
      console.log('⚙️ 설정 상태');
      console.log(`   설정 파일: ${getStatusIcon(config.exists)} ${config.exists ? '존재함' : '없음'}`);
      console.log(`   유효성: ${getStatusIcon(config.valid)} ${config.valid ? '유효함' : '오류 있음'}`);
      console.log(`   경로: ${config.path}\n`);

      // 종속성 정보
      console.log('📦 종속성 상태');
      console.log(`   총 패키지: ${dependencies.total}`);
      console.log(`   오래된 패키지: ${dependencies.outdated > 0 ? '⚠️' : '✅'} ${dependencies.outdated}`);
      console.log(`   취약점: ${dependencies.vulnerabilities > 0 ? '🚨' : '✅'} ${dependencies.vulnerabilities}\n`);

      // 파일 정보
      console.log('📄 파일 통계');
      console.log(`   총 파일 수: ${files.total}`);
      console.log(`   TypeScript: ${files.typescript}`);
      console.log(`   JavaScript: ${files.javascript}`);
      console.log(`   테스트 파일: ${files.tests}\n`);

      // 종합 건강 점수
      const healthScore = calculateHealthScore(status);
      console.log('🏥 프로젝트 건강 점수');
      console.log(`   점수: ${healthScore.score}/100 ${getHealthIcon(healthScore.score)}`);
      if (healthScore.recommendations.length > 0) {
        console.log('   개선 권장 사항:');
        healthScore.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
      }
      console.log('');

    } catch (error) {
      logger.error('상태 확인 중 오류가 발생했습니다:', error);
    }
  });

function calculateHealthScore(status: ProjectStatus): { score: number; recommendations: string[] } {
  let score = 0;
  const recommendations: string[] = [];

  // Git 상태 (25점)
  if (!status.git.hasUncommitted) score += 15;
  else recommendations.push('커밋되지 않은 변경사항을 커밋하세요');
  
  if (status.git.remote !== '설정되지 않음') score += 10;
  else recommendations.push('원격 저장소를 설정하세요');

  // 설정 상태 (25점)
  if (status.config.exists) score += 15;
  else recommendations.push('Dooray AI 설정을 초기화하세요 (dooray-ai config init)');
  
  if (status.config.valid) score += 10;
  else recommendations.push('설정 파일을 검증하세요 (dooray-ai config validate)');

  // 종속성 상태 (25점)
  if (status.dependencies.vulnerabilities === 0) score += 15;
  else recommendations.push('보안 취약점을 해결하세요 (npm audit fix)');
  
  if (status.dependencies.outdated === 0) score += 10;
  else recommendations.push('오래된 패키지를 업데이트하세요 (npm update)');

  // 코드 품질 (25점)
  const codeRatio = status.files.typescript / (status.files.typescript + status.files.javascript);
  if (codeRatio > 0.8) score += 15;
  else if (codeRatio > 0.5) score += 10;
  else if (codeRatio > 0.2) score += 5;
  else recommendations.push('TypeScript 사용을 늘려보세요');

  const testRatio = status.files.tests / status.files.total;
  if (testRatio > 0.2) score += 10;
  else if (testRatio > 0.1) score += 5;
  else recommendations.push('테스트 커버리지를 늘려보세요');

  return { score, recommendations };
}

function getHealthIcon(score: number): string {
  if (score >= 90) return '🟢 훌륭함';
  if (score >= 70) return '🟡 양호함';
  if (score >= 50) return '🟠 보통';
  return '🔴 개선 필요';
} 
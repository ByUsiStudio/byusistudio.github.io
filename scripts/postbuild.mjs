#!/usr/bin/env node
/**
 * 构建后处理脚本（npm run build 后自动执行）
 *
 * 功能：
 *  1. 将 dist/ 编译产物复制到部署输出目录（默认 ./deploy/dist）
 *  2. 将后端文件（默认 ./backend）复制到部署输出目录（默认 ./deploy）
 *
 * 可通过环境变量自定义路径：
 *   - DEPLOY_DIR      部署根目录，默认 ./deploy
 *   - DIST_TARGET_DIR dist/ 的目标位置，默认 ${DEPLOY_DIR}/dist
 *   - BACKEND_SRC     后端源文件目录，默认 ./backend（若不存在则跳过）
 *   - BACKEND_TARGET  后端目标目录，默认 ${DEPLOY_DIR}/backend
 */
import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const env = process.env;
const DEPLOY_DIR = resolve(projectRoot, env.DEPLOY_DIR ?? './deploy');
const DIST_SRC = resolve(projectRoot, './dist');
const DIST_TARGET = resolve(projectRoot, env.DIST_TARGET_DIR ?? `${DEPLOY_DIR}/dist`);
const BACKEND_SRC = resolve(projectRoot, env.BACKEND_SRC ?? './backend');
const BACKEND_TARGET = resolve(projectRoot, env.BACKEND_TARGET ?? `${DEPLOY_DIR}/backend`);

function log(label, msg) {
  const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  console.log(`[${ts}] [${label}] ${msg}`);
}

function cleanCopy(src, dest, label) {
  if (!existsSync(src)) {
    log(label, `源目录不存在，跳过: ${src}`);
    return false;
  }
  mkdirSync(dirname(dest), { recursive: true });
  if (existsSync(dest)) {
    log(label, `清理旧目录: ${dest}`);
    rmSync(dest, { recursive: true, force: true });
  }
  log(label, `复制 ${src} → ${dest}`);
  cpSync(src, dest, { recursive: true, force: true });
  return true;
}

// ---- 主流程 ----
log('PostBuild', '开始执行构建后处理...');
mkdirSync(DEPLOY_DIR, { recursive: true });

// 1. 前端编译产物
const distOk = cleanCopy(DIST_SRC, DIST_TARGET, 'Dist');
if (distOk) {
  log('Dist', '前端编译产物部署完成 ✓');
} else {
  log('Dist', '⚠️  dist/ 目录未生成，请检查 vite build 是否成功');
  process.exitCode = 1;
}

// 2. 后端文件（若存在）
const backendOk = cleanCopy(BACKEND_SRC, BACKEND_TARGET, 'Backend');
if (backendOk) {
  log('Backend', '后端文件部署完成 ✓');
} else {
  log('Backend', '后端源目录不存在，已跳过（此为可选步骤）');
}

log('PostBuild', `全部完成，部署目录: ${DEPLOY_DIR}`);

import defaultSettings from '@/settings'

const title = defaultSettings.title || '安龙电机配件厂仓储管理系统'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}

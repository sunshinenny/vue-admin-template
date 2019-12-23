/**
 * api接口统一管理
 */
import {
  get,
  post,
  json,
  upload,
  download,
  baseURL
} from './http'

/**
 * 文件操作相关接口
 */
// export const uploadURL = baseURL+'/mis/tools/upload' // 上传
// export const fileDownload = p => download('/mis/tools/download', p, ) // 下载
/**
 * user相关方法
 */
export const login = p => post('/wms/user/login', p, )
export const info = p => post('/wms/user/info', p, )
/**
 * 库存信息相关接口
 */
export const pageAllStockByAddress = p => post('/wms/stock/pageAllStockByAddress', p, ) // 分页查询所有的库存信息
export const listStockByAddressAndModel = p => post('/wms/stock/listStockByAddressAndModel', p, ) // 
export const changeStockNum = p => post('/wms/stock/changeStockNum', p, ) // 出入库操作
export const listStockHistory = p => post('/wms/stock/listStockHistory', p, ) // 显示一条记录的历史记录
export const historyReset = p => post('/wms/stock/historyReset', p, ) // 回退
// export const newOrUpdateSubscribe = p => post('/wms/stock/newOrUpdateSubscribe', p, ) // 新增或更新预约
export const submitSubscribe = p => post('/wms/stock/submitSubscribe', p, ) // 新增或更新预约
export const addRecordAPI = p => post('/wms/stock/addRecord', p, ) // 
export const editRecordAPI = p => post('/wms/stock/editRecord', p, ) // 
export const removeRecordAPI = p => post('/wms/stock/removeRecord', p, ) // 
/**
 * 型号相关接口
 */
export const listModel = p => post('/wms/model/listModel', p, ) // 获取所有的型号记录,并且根据其父子关系处理好字符串
/**
 * 地址相关接口
 */
export const listAddress = p => post('/wms/address/listAddress', p, ) // 获取所有仓库的地址
/**
 * 预约表
 */
export const listSubscribeByStockId = p => post('/wms/subscribe/listSubscribeByStockId', p, )
export const newOrUpdateSubscribe = p => post('/wms/subscribe/newOrUpdateSubscribe', p, )
export const deleteSubscribe = p => post('/wms/subscribe/deleteSubscribe', p, ) // 

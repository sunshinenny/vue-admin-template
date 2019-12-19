npm run build:prod
rm -rf /Users/sunshinenny/Desktop/项目/仓储管理系统/wms-web/wms
mv /Users/sunshinenny/Desktop/项目/仓储管理系统/wms-web/dist  /Users/sunshinenny/Desktop/项目/仓储管理系统/wms-web/wms
scp -r  /Users/sunshinenny/Desktop/项目/仓储管理系统/wms-web/wms root@193.112.129.74:/home
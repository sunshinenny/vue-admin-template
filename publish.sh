npm run build:prod
rm -rf /Users/sunshinenny/Code/项目/仓储管理系统/wms-web/wms
mv /Users/sunshinenny/Code/项目/仓储管理系统/wms-web/dist  /Users/sunshinenny/Code/项目/仓储管理系统/wms-web/wms
scp -r  /Users/sunshinenny/Code/项目/仓储管理系统/wms-web/wms root@193.112.129.74:/home
cd student
NODE_ENV=development nodemon -e js,ts --watch src --exec "yarn build" &
cd ../teacher
NODE_ENV=development nodemon -e js,ts --watch src --exec "yarn build" &
cd ../admin
NODE_ENV=development nodemon -e js,ts --watch src --exec "yarn build" &
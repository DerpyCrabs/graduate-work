yarn global add serve
serve -l 3001 -p admin &
serve -l 3002 -p teacher &
serve -l 3003 -p student &
cd backend
yarn
yarn start
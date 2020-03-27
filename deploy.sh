serve -s -l 3001 admin/build &
serve -s -l 3002 teacher/build &
serve -s -l 3003 student/build &
cd backend
yarn
yarn start
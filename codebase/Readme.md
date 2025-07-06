### Start mysql container.
cd codebase/database

docker build -t mysql .

docker run -p 3306:3306 mysql

------------------------------
### To test Api use beloow curl command.

1. Signup:

curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "username": "alice", "password": "pass123"}'



 2. Login

 curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "pass123"}'

output:

{ "sessionId": "generated-session-id" }


3. Add Balance by User ID (Admin can external add amount to account no need to required sessionid or login)

curl -X POST http://localhost:3000/add-balance \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "amount": 500}'


4. transfer

curl -X POST http://localhost:3001/transfer \
  -H "Content-Type: application/json" \
  -H "x-session-id: your-session-id-here" \
  -d '{
    "to_user": "bob",
    "amount": 200
  }'

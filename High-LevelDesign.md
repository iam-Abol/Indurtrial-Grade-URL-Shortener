problem: 
it gets a long url -> the service creates an alias with shorter length -> if u click the url you will be redirected to the original url
* as short as possible 
base 62 -> 0-9 & a-z & A-Z

architecture diagram : 
Client → API Gateway / Backend Service
Backend Service →  Cache (Redis) / Database (PostgreSQL)

Components:
- API Server: nest
- Database: postgres(Prisma Orm)
- Cache: Redis
- Message Queue: RabbitMQ





Api endpoints: 

POST api/v1/shorten 
body:
{
  "longUrl": "https://example.com"
}
• return shortURL

GET /:shortUrl -> return longUrl and then redirects -> 301 because it is seo friendly and its permanent maybe 302  for click rate? 🤷‍♂️ decision: 302 for click tracking (maybe a combination of both ) 

** click rate + validate urls
database tables: 

user: 
- id
- email
- password_hash
- created_at
- updated_at
- delete_at
optional :(- isVerifiend -> send emali)

url
- id
- user_id
- shortUrl -> length() = 6 (62^6 = 56B)
- longUrl
- created_at
- expires_at (optional)
- click_count
- delete_at
ClickAnalytics -> write heavy -> probably needs a seperated db
- id
- url id
- ip
- timestamp
- country
- user_agent -> browser + device
- referer
rate limit -> 5 request per ip per second


shorten flow
1 client send long url
2 validate url
3 check db -> if it has already been shotened -> return it
4 generate shortcode
5 save in db
6 cache in redis
7 return short url

Redirect Flow
1 user clicks shortUrl
2 check redis
3 if miss -> query postgres
4 redirect to longUrl
5 send click event to queue

Analytics Flow
1 redirect event published
2 worker consumes the event
3 store click data
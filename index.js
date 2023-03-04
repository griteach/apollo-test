import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
dotenv.config();
import dayjs from "dayjs";

const MY_API_KEY = process.env.API_KEY;
const today = dayjs().format("YYYYMMDD");
const todayFormatDash = dayjs().format("YYYY-MM-DD");
const currentHour = dayjs().get("hour") - 1;
console.log(today);
console.log(todayFormatDash);
console.log(currentHour);
//미세먼지 기본 패쓰
const DUST_PATH_BASIC = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc";
//측정소별 실시간 미세먼지 데이터
const DUST_URL = "/getCtprvnRltmMesureDnsty";

//일기예보 기본 패쓰
const WEATHER_PATH_BASIC =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";

//단기예보 (최저/최고기온) 기본 패쓰
const FOCAST_WEATHER_GUESS_PATH_BASIC =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type Dust {
    id: String
    stationName: String
    dataTime: String
    pm10Grade: String
    pm10Grade1h: String
    pm10Value: String
    pm10Value24: String
    pm25Grade1h: String
    pm25Value: String
    pm25Value24: String
    pm25Grade: String
    khaiGrade: String
    khaiValue: String
    sidoName: String
  }

  type WeatherGuess {
    baseDate: String
  baseTime: String
  category: String
  fcstDate: String
  fcstTime: String
  fcstValue: String
  nx: Float
  ny: Float
  }

  type Weather {
    id:String
    baseDate: String
    baseTime: String
    category: String
    nx: Float
    ny: Float
    obsrValue: String

  }
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    
    allDusts: [Dust]
    dust(stationName:String!):Dust
    allWeather:[Weather]
    allWeatherGuess:[WeatherGuess]
    
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    allWeatherGuess() {
      return fetch(
        `${WEATHER_PATH_BASIC}?serviceKey=${MY_API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${today}&base_time=0200&nx=75&ny=125`
      )
        .then((response) => response.json())
        .then((r) => r.response.body.items.item)
        .then((r) => {
          console.log(r);
          return r;
        });
    },
    allWeather() {
      return fetch(
        `${WEATHER_PATH_BASIC}?serviceKey=${MY_API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${today}&base_time=${
          currentHour < 10 ? `0` + currentHour : currentHour
        }00&nx=75&ny=125`
      )
        .then((response) => response.json())
        .then((r) => r.response.body.items.item)
        .then((result) =>
          result.map((item, index) => ({ id: index + 1, ...item }))
        )
        .then((r) => {
          console.log(r);
          return r;
        });
    },
    allDusts() {
      return fetch(
        `${DUST_PATH_BASIC}${DUST_URL}?serviceKey=${MY_API_KEY}&numOfRows=100&returnType=json&ver=1.3&sidoName=${encodeURIComponent(
          "강원"
        )}`
      )
        .then((response) => response.json())
        .then((r) => r.response.body.items)
        .then((result) =>
          result.map((item, index) => ({ id: index + 1, ...item }))
        )
        .then((r) => {
          console.log(r);
          return r;
        });
    },
    dust(_, { stationName }) {
      return fetch(
        `${DUST_PATH_BASIC}${DUST_URL}?serviceKey=${MY_API_KEY}&numOfRows=100&returnType=json&ver=1.3&sidoName=${encodeURIComponent(
          "강원"
        )}`
      )
        .then((response) => response.json())
        .then((r) => r.response.body.items)
        .then((result) =>
          result.map((item, index) => ({ id: (index + 1).toString(), ...item }))
        )
        .then((r) => {
          const result = r.find((item) => item.stationName === stationName);

          console.log(result);
          return result;
        });
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 5000 },
});

console.log(`🚀  Server ready at: ${url}`);

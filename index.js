import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dotenv from "dotenv";
dotenv.config();
import dayjs from "dayjs";

const MY_API_KEY = process.env.API_KEY;

const NEIS_API_KEY = process.env.NEIS_KEY;

//나이스 급식정보
const ATPT_OFCDC_SC_CODE = "K10";
const SD_SCHUL_CODE = "7892021";
const MMEAL_SC_CODE = "2";

//나이스 급식 정보 패쓰
const MEAL_PATH_BASIC = "https://open.neis.go.kr/hub/mealServiceDietInfo";

//나이스 학사일정 정보 패쓰
const SCHEDULE_PATH_BASIC = "https://open.neis.go.kr/hub/SchoolSchedule";

//특일 정보
//기념일 정보
const ANNIVERSARY_INFO =
  "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getAnniversaryInfo";
//?No=1&numOfRows=10&solYear=2023&solMonth=05

//중기육상예보
const MEDIUM_WEATHER_LAND_WEATHER =
  "http://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst";

//중기 기온 예보
const MEDIUM_TEMP =
  "http://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa";

//미세먼지 기본 패쓰
const DUST_PATH_BASIC = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc";

//시도별 실시간 미세먼지 데이터
const DUST_URL = "/getCtprvnRltmMesureDnsty";

//초단기 실황조회 일기예보 기본 패쓰
const WEATHER_PATH_BASIC =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";

//단기예보 (최저/최고기온) 기본 패쓰
const FOCAST_WEATHER_GUESS_PATH_BASIC =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  type MediumTemp{
    regId:String            
    taMin3: Int
    taMin3Low: Int
    taMin3High: Int
    taMax3: Int
    taMax3Low: Int
    taMax3High: Int
    taMin4: Int
    taMin4Low: Int
    taMin4High: Int
    taMax4: Int
    taMax4Low: Int
    taMax4High: Int
    taMin5: Int
    taMin5Low: Int
    taMin5High: Int
    taMax5: Int
    taMax5Low: Int
    taMax5High: Int
    taMin6: Int
    taMin6Low: Int
    taMin6High: Int
    taMax6: Int
    taMax6Low: Int
    taMax6High: Int
    taMin7: Int
    taMin7Low: Int
    taMin7High: Int
    taMax7: Int
    taMax7Low: Int
    taMax7High: Int
    taMin8: Int
    taMin8Low: Int
    taMin8High: Int
    taMax8: Int
    taMax8Low: Int
    taMax8High: Int
    taMin9: Int
    taMin9Low: Int
    taMin9High: Int
    taMax9: Int
    taMax9Low: Int
    taMax9High: Int
    taMin10: Int
    taMin10Low: Int
    taMin10High: Int
    taMax10: Int
    taMax10Low: Int
    taMax10High: Int
  }
  type MediumLand{
    regId: String
    rnSt3Am: Int
    rnSt3Pm: Int
    rnSt4Am: Int
    rnSt4Pm: Int
    rnSt5Am: Int
    rnSt5Pm: Int
    rnSt6Am: Int
    rnSt6Pm: Int
    rnSt7Am: Int
    rnSt7Pm: Int
    rnSt8: Int
    rnSt9: Int
    rnSt10: Int
    wf3Am: String
    wf3Pm: String
    wf4Am: String
    wf4Pm: String
    wf5Am: String
    wf5Pm: String
    wf6Am: String
    wf6Pm: String
    wf7Am: String
    wf7Pm: String
    wf8: String
    wf9: String
    wf10: String
  }
  
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
    o3Value:String
    o3Grade:String
    coValue:String
    coGrade:String
    no2Value:String
    no2Grade:String
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
 type Meal {
    date: String
    menu: [String]
    cal:String
    ntr:[String]
    MLSV_YMD:String
  }
  type Schedule {
    date: String
    schedule:[String]
  }

  type AnniversaryInfo{
    dateKind:String
    dateName:String
    isHoliday:String
    locdate:Int
    seq:Int
  }
  
  
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    
    allDusts: [Dust]
    dust(stationName:String!):Dust
    allWeather:[Weather]
    allWeatherGuess:[WeatherGuess]
    lunch(schoolCode: String!, officeCode: String!): Meal
    schedule(schoolCode: String!, officeCode: String!): Schedule
    mediumLand:MediumLand
    mediumTemp:MediumTemp
    anniversaryInfo:[AnniversaryInfo]
    
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    anniversaryInfo() {
      const year = dayjs().format("YYYY");
      const month = dayjs().format("MM");

      console.log(year, month);
      return fetch(
        `${ANNIVERSARY_INFO}?serviceKey=${MY_API_KEY}&pageNo=1&numOfRows=100&solYear=${year}&solMonth=${month}&_type=json`
      )
        .then((r) => r.json())
        .then((r) => r.response.body.items.item);
    },

    lunch: async (_, { schoolCode, officeCode }) => {
      const today = dayjs().format("YYYYMMDD");
      console.log("today", today);
      const url = `${MEAL_PATH_BASIC}?ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&Type=json&Key=${NEIS_API_KEY}&MLSV_YMD=${today}`;

      const response = await fetch(url);
      const data = await response.json();

      // const todayLunch = data.mealServiceDietInfo[1].row.find(
      //   (meal) => meal.MLSV_YMD === today
      // );
      // console.log("todayLunch : ", todayLunch);

      const lunch =
        data.mealServiceDietInfo[1].row[0].DDISH_NM.split(/, |<br\/>/);
      const cal = data.mealServiceDietInfo[1].row[0].CAL_INFO;
      const ntr =
        data.mealServiceDietInfo[1].row[0].NTR_INFO.split(/<br\s*\/?>/g);

      const calledDate = data.mealServiceDietInfo[1].row[0].MLSV_YMD;
      console.log("calledDate: ", calledDate);

      // console.log(
      //   "lunch is called.",
      //   data.mealServiceDietInfo[1].row.find(
      //     (meal) => meal.MLSV_YMD === "20230607"
      //   )
      // );
      console.log("lunch : ", lunch);
      console.log("cal : ", cal);
      console.log("ntr : ", ntr);

      return { date: today, menu: lunch, cal: cal, ntr: ntr };
    },
    schedule: async (_, { schoolCode, officeCode }) => {
      const today = dayjs().format("YYYYMMDD");
      const url = `${SCHEDULE_PATH_BASIC}?ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&Type=json&KEY=${NEIS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      const schedule = data.SchoolSchedule.find();
      console.log("schedule is called.");
      console.log("schedule : ", data);

      return { date: today, schedule: schedule };
    },
    allWeatherGuess() {
      const today = dayjs().format("YYYYMMDD");
      return fetch(
        `${FOCAST_WEATHER_GUESS_PATH_BASIC}?serviceKey=${MY_API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${today}&base_time=0200&nx=75&ny=125`
      )
        .then((response) => response.json())
        .then((r) => r.response.body.items.item);
    },
    allWeather() {
      const today = dayjs().format("YYYYMMDD");
      const currentHour = dayjs().get("hour") - 1;
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
          return r;
        });
    },
    mediumLand() {
      const today = dayjs().format("YYYYMMDD");

      return fetch(
        `${MEDIUM_WEATHER_LAND_WEATHER}?serviceKey=${MY_API_KEY}&numOfRows=10&dataType=json&regId=11D10000&tmFc=${today}0600`
      )
        .then((response) => response.json())
        .then((r) => {
          const finalResult = r.response.body.items.item[0];

          return finalResult;
        });
    },
    mediumTemp() {
      const today = dayjs().format("YYYYMMDD");

      return fetch(
        `${MEDIUM_TEMP}?serviceKey=${MY_API_KEY}&numOfRows=10&dataType=json&regId=11D10401&tmFc=${today}0600`
      )
        .then((response) => response.json())
        .then((r) => {
          const finalResult = r.response.body.items.item[0];

          return finalResult;
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
  // Real Server
  listen: { port: 5000 },

  // Dev Server
  // listen: { port: 5001 },
});

console.log(`🚀  Server ready at: ${url}`);

import { DuckDBInstance } from "@duckdb/node-api";
const sql = String.raw;

const instance = await DuckDBInstance.create();
const connection = await instance.connect();

const topSentReader = await connection.runAndReadAll(sql`
  SELECT * 
  FROM 'src/data/diplomatic-visits/top_sent.parquet'
  ORDER BY TripYear;
`);

const topReceivedReader = await connection.runAndReadAll(sql`
  SELECT * 
  FROM 'src/data/diplomatic-visits/top_received.parquet'
  ORDER BY TripYear;
`);
const sentJsonData = topSentReader.getRowObjectsJson();
const receivedJsonData = topReceivedReader.getRowObjectsJson();

process.stdout.write(JSON.stringify({
   sentJsonData,
   receivedJsonData 
}));

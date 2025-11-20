import { DuckDBInstance } from "@duckdb/node-api";
const sql = String.raw;

const instance = await DuckDBInstance.create();
const connection = await instance.connect();

const reader = await connection.runAndReadAll(sql`
  SELECT *
  FROM 'src/data/visits.parquet'
  ORDER BY TripYear;
`);

const jsonData = reader.getRowObjectsJson();

process.stdout.write(JSON.stringify(jsonData));

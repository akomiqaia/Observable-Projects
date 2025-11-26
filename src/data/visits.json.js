import { DuckDBInstance } from "@duckdb/node-api";
const sql = String.raw;

const instance = await DuckDBInstance.create();
const connection = await instance.connect();

const reader = await connection.runAndReadAll(sql`
  SELECT * REPLACE (
      strftime(TripStartDate, '%Y-%m-%d') AS TripStartDate,
      strftime(TripEndDate, '%Y-%m-%d') AS TripEndDate
    )
  FROM 'src/data/visits.parquet'
  ORDER BY TripYear;
`);

const jsonData = reader.getRowObjectsJson();
process.stdout.write(JSON.stringify(jsonData));

import axios from "axios";
import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { useSearchParams } from "react-router-dom";
import "./MapCharts.css";
import TableData, { tableDataType } from "./TableData";

const allLabels = [
  { label: "TI", name: "Total Interchange" },
  { label: "DF", name: "Day-ahead demand forecast" },
  { label: "D", name: "Demand" },
  { label: "NG", name: "Net generation" },
];

interface Respondent {
  flag?: string | null;
  has_subregion?: "N" | "Y";
  id?: string;
  lat: number;
  lon: number;
  name?: string;
  radius: number;
  region_id?: string;
  retirement_date?: null | string | Date;
  time_zone?: null | string;
  type?: string;
}

interface PathData {
  id?: string;
  lat: number;
  lon: number;
}

interface ConnectedData {
  from: PathData;
  to: PathData[];
}

const geoUrl =
  //"https://raw.githubusercontent.com/deldersveld/topojson/master/continents/north-america.json";
  "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers.json";

const today = new Date();
const maxDate = today.toISOString().split("T")[0];

const columnsForTable = [
  "Respondent-Name",
  "Timezone",
  "Type-Name",
  "value",
  "units",
];

export default function MapChart() {
  const [rerspondentDatas, setRespondentDatas] = useState<Respondent[]>([]);
  const [connectionData, setConnectionData] = useState<ConnectedData[]>([]);
  const [tableData, setTableData] = useState<tableDataType>();
  const [overViewData, setOverviewData] = useState<tableDataType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const dateParam = searchParams.get("date");

  useEffect(() => {
    let data_respondent_array: Respondent[] = [];
    const dataForRespondentAndConnections = async () => {
      data_respondent_array = await fetchRespondentData();
      await fetchRespondentConnections(data_respondent_array);
    };
    const fetchConnections = async () => {};
    dataForRespondentAndConnections();
    fetchConnections();
  }, []);

  useEffect(() => {
    fetchDailyData();
  }, [idParam, dateParam]);

  const getReadius = (x: number) => {
    if (x >= 0 && x <= 15000) return 4;
    else if (x >= 15001 && x <= 30101) return 8;
    else if (x >= 30102 && x <= 60203) return 16;
    else return 20;
  };

  const fetchRespondentConnections = async (
    data_respondent_array: Respondent[]
  ) => {
    try {
      let data_connections = await axios.get(
        "https://www.eia.gov/electricity/930-api//interconnections/data?type[0]=BA&type[1]=BR"
      );
      let data_connections_values = data_connections?.data[0]?.data;
      let structuredData: ConnectedData[] = [];
      data_connections_values?.forEach((valueToBeSearched: any) => {
        const fromValueIndex = data_respondent_array.findIndex(
          (value) => value?.id === valueToBeSearched?.from_respondent
        );
        const toValueIndex = data_respondent_array.findIndex(
          (value) => value?.id === valueToBeSearched?.to_respondent
        );
        const indexToUpdate = structuredData.findIndex(
          (d: ConnectedData) =>
            d?.from?.id === valueToBeSearched?.from_respondent
        );
        if (indexToUpdate === -1) {
          let newData: ConnectedData = {
            from: {
              id: data_respondent_array[fromValueIndex].id,
              lat: data_respondent_array[fromValueIndex]?.lat,
              lon: data_respondent_array[fromValueIndex]?.lon,
            },
            to: [
              {
                id: data_respondent_array[toValueIndex].id,
                lat: data_respondent_array[toValueIndex]?.lat,
                lon: data_respondent_array[toValueIndex]?.lon,
              },
            ],
          };
          structuredData.push(newData);
        } else {
          structuredData[indexToUpdate].to.push({
            id: data_respondent_array[toValueIndex].id,
            lat: data_respondent_array[toValueIndex]?.lat,
            lon: data_respondent_array[toValueIndex]?.lon,
          });
        }
      });
      setConnectionData(structuredData);
    } catch (err) {
      console.log("err");
      console.log(err);
    }
  };

  const fetchRespondentData = async () => {
    try {
      let data_respondent = await axios.get(
        "https://www.eia.gov/electricity/930-api//respondents/data?type[0]=BA&type[1]=BR"
      );
      let data_respondent_array: Respondent[] =
        data_respondent?.data?.[0]?.data;

      setRespondentDatas(data_respondent_array);
      return data_respondent_array;
    } catch (e) {
      return [];
    }
  };

  const fetchDailyData = async () => {
    try {
      const requestData = {
        params: {
          frequency: "daily",
          "data[0]": "value",
          "facets[respondent][]": `${idParam ? idParam : "US48"}`,
          start: `${dateParam ? dateParam : maxDate}`,
          end: `${dateParam ? dateParam : maxDate}`,
          "sort[0][column]": "period",
          "sort[0][direction]": "desc",
          "sort[1][column]": "value",
          "sort[1][direction]": "asc",
          offset: 0,
          length: 5000,
          api_key: process.env.REACT_APP_API_KEY, // Add the API key as a parameter
        },
      };
      const response = await axios.get(
        "https://api.eia.gov/v2/electricity/rto/daily-region-data/data/",
        requestData
      );

      if (response.status === 200) {
        const twoDArray: any[][] = [];
        response?.data?.response?.data?.forEach(
          (entry: { [x: string]: any }): any => {
            const row = [
              entry["respondent-name"] || "",
              entry["timezone"] || "",
              entry["type-name"] || "",
              entry["value"] || "",
              entry["value-units"] || "",
            ];
            twoDArray.push(row);
          }
        );

        const twoDArrayOverView: any[][] = [];
        for (const colValues in allLabels) {
          const currLabel = allLabels[colValues];
          const dataForLabel = response?.data?.response?.data?.filter(
            (entry: any) => entry?.type === currLabel.label
          );

          const sumForLabel = dataForLabel.reduce(
            (accumulator: number, dataWithSimilarType: any) =>
              dataWithSimilarType?.value + accumulator,
            0
          );

          twoDArrayOverView.push([currLabel.name, sumForLabel]);
        }
        setOverviewData({
          columNames: ["Label", "Total Electricity"],
          columnData: twoDArrayOverView,
        });
        setTableData({ columNames: columnsForTable, columnData: twoDArray });
      } else {
        console.log("error in api call");
      }
    } catch (err) {
      console.error("error");
      console.log(err);
    }
  };

  return (
    <div>
      <h2>
        Showing results for
        {idParam !== "US48"
          ? ` 
        ${rerspondentDatas?.filter((d) => d.id === idParam)?.at(0)?.name}`
          : " US Lower 48"}
      </h2>
      <div className="MapCharts-container">
        <Tooltip id="my-tooltip" />
        <div className="tableDiv">
          <div>
            <h5> Electricity consumption Overview (megawatts) </h5>
          </div>
          {/* <TableData /> */}
          <TableData
            columNames={overViewData?.columNames}
            columnData={overViewData?.columnData}
          />
        </div>
        <div className="mapDiv">
          <ComposableMap onClick={() => null} projection="geoAlbers">
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                    key={geo.rsmKey}
                    geography={geo}
                    stroke="rgb(224, 224, 224)"
                    fill="rgb(173, 173, 173)"
                  />
                ))
              }
            </Geographies>

            {connectionData?.length &&
              connectionData?.map(({ from, to }) =>
                to?.map(({ lat, lon }) => (
                  <Line
                    z={2}
                    stroke={idParam === from?.id ? "red" : "black"}
                    strokeWidth={idParam === from?.id ? 1 : 0.2}
                    strokeLinecap="round"
                    from={[from?.lon, from?.lat]}
                    to={[lon, lat]}
                  ></Line>
                ))
              )}

            {rerspondentDatas?.length &&
              rerspondentDatas?.map(({ lat, lon, radius, id, name }) =>
                lat && lon && radius ? (
                  <Marker key={id} coordinates={[lon, lat]}>
                    <circle
                      onClick={() =>
                        setSearchParams(() => ({
                          date: dateParam ? dateParam : "",
                          id: id || "",
                        }))
                      }
                      style={{
                        outline: "none",
                      }}
                      data-tooltip-id="my-tooltip"
                      data-tooltip-content={`${id} : ${name}`}
                      key={id}
                      r={getReadius(radius)}
                      fill={id === idParam ? "red" : "rgb(208, 235, 248)"}
                      stroke="black"
                    />
                  </Marker>
                ) : (
                  <></>
                )
              )}
          </ComposableMap>
        </div>
      </div>
    </div>
  );
}

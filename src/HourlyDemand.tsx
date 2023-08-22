import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getNextDay, getTodaysDate } from "./utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HourDataType {
  period: string;
  respondent: string;
  "respondent-name": string;
  type: string;
  "type-name": string;
  value: number;
  "value-units": string;
}

interface DatasetType {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Electricity usage",
    },
  },
};

function HourlyDemand() {
  const [dataForChart, setData] = useState<any>();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const dateParam = searchParams.get("date");

  const createDataSet = (apiData: HourDataType[] = []) => {
    const dataTI = apiData?.filter((val) => val.type === "TI");
    const dataDF = apiData?.filter((val) => val.type === "DF");
    const dataNG = apiData?.filter((val) => val.type === "NG");
    const dataD = apiData?.filter((val) => val.type === "D");

    const dataTITime = dataTI?.map((d) => d.period.split("T")[1]);
    const dataDFTime = dataDF?.map((d) => d.period.split("T")[1]);
    const dataNGTime = dataNG?.map((d) => d.period.split("T")[1]);
    const dataDTime = dataD?.map((d) => d.period.split("T")[1]);

    const combinedSet = new Set([
      ...dataTITime,
      ...dataDFTime,
      ...dataNGTime,
      ...dataDTime,
    ]);

    const labels = Array.from(combinedSet).sort();

    const datasetsTI = dataTI?.map((d) => d.value);

    const datasetsDF = dataDF?.map((d) => d.value);

    const datasetsNG = dataNG?.map((d) => d.value);

    const datasetsD = dataD?.map((d) => d.value);

    const datasets: DatasetType[] = [
      {
        label: "Total Interchange",
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        data: datasetsTI,
      },
      {
        label: "Demand Forecast",
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        data: datasetsDF,
      },
      {
        label: "Net Generation",
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        data: datasetsNG,
      },
      {
        label: "Demand ",
        borderColor: "rgb(220, 20, 60)",
        backgroundColor: "rgba(220, 20, 60, 0.5)",
        data: datasetsD,
      },
    ];
    setData({ datasets, labels });
  };

  const fetchHourlyData = async () => {
    try {
      const requestData = {
        params: {
          frequency: "local-hourly",
          "data[0]": "value",
          "facets[respondent][]": `${idParam ? idParam : "US48"}`,
          start: `${dateParam ? `${dateParam}` : `${getTodaysDate()}`}`,
          end: `${
            dateParam
              ? `${getNextDay(dateParam)}`
              : `${getNextDay(getTodaysDate())}`
          }`,
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
        "https://api.eia.gov/v2/electricity/rto/region-data/data/",
        requestData
      );
      if (response?.status === 200) {
        createDataSet(response?.data?.response?.data);
      }
    } catch (err) {
      console.error("error");
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchNewData = async () => await fetchHourlyData();
    fetchNewData();
  }, [idParam, dateParam]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px 0px 10px 0px",
        marginTop: "20px",
      }}
    >
      <h2>
        {" "}
        This chart shows hourly usage of electricity in different fields{" "}
      </h2>
      <div className="lineChart">
        {dataForChart && <Line options={options} data={dataForChart} />}
      </div>
    </div>
  );
}

export default HourlyDemand;

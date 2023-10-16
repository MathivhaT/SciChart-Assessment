"use client";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  ELegendOrientation,
  ELegendPlacement,
  EPieType,
  EllipsePointMarker,
  FastLineRenderableSeries,
  GradientParams,
  NumberRange,
  NumericAxis,
  PieSegment,
  Point,
  SciChartJsNavyTheme,
  SciChartPieSurface,
  SciChartSurface,
  SweepAnimation,
  XyDataSeries,
  ZoomPanModifier,
} from "scichart";

const SciChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [searchResults, setsearchResults] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [county, setCounty] = useState("");

  useEffect(() => {
    // Read the CSV file from public directory
    fetch("/crop_yields.csv")
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            setData(result.data);
          },
        });
      });

    // SciChart configuration
    SciChartSurface.setRuntimeLicenseKey(
      "608Xrom1DhOrRTkooAXAGProj8hMilPYGzwr/rJ9PRJS4RKlKl3o9vPeQi+zR5JY41UiwyfcRKxmtRnZte+RB3si0Jtzq722ZXzrTiiA4p+yAdtOKvl84n00MhUfkGjHDvavCWoAFl50wtkKp+OIbJN1Bsq1VuQ8Mg0JJ7RiIzHYcwOcjS2LiDMZv337h7HJNA8TupesTE1yawqJwObjavlyUyi7himvCJyHCsvPECWHuK80xAKKucwgakxorTHCJe1rKy4z2SdGMzi94zgyvOTSAngWRjz/cu7DOCQfSimH+VYoennzvRgFycpQQyp8UwRYDhaSDlDiMTuKR9Waq66esQOtrGPO/9yZCkQRl1OtoOQJ8wHjC1vrcOsMzbzfBsFzj9poHaWDf7ys8TGsXFj4Y/nE+GKTR3SRsKrf0jK/PyDX8PJTBtLBh+GqQ9FjWDn91+kf4AgIJiV9annGOs2vTaXcvpMg+rPsVov4g2HlAh7XnMn1QCQYZKu79V3BXczzrhqMvA+2I93NPKiEsNKOxWvGAT+Ctz4Vre0WOK0AZu/mlvmHJXnDyPrQ5jnpozRavO8kqo9x"
    );
  }, []);

  useEffect(() => {
    // Filter the data based on the search term
    let filtered = [];
    if (searchTerm) {
      const fliterbySelectedCounty = data.filter(
        (item) =>
          String(item.country).toLowerCase() === searchTerm.toLowerCase() &&
          item.year >= 2015
      );
      const fliterbySearch = data.filter(
        (item) =>
          String(item.country)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) && item.year >= 2015
      );

      filtered = county != null ? fliterbySearch : fliterbySelectedCounty;
      console.log();
    }
    setFilteredData(filtered);
    searchList(filtered);
    const chartInitializationPromise = initSciChart(filtered);
    chartInitializationPromise;
  }, [searchTerm,data]);

  const selectCounty = (county: string) => {
    setCounty(county);
    setsearchResults([]);
    setSearchTerm(county);
  };

  function searchList(list: any[]) {
    let CountyList: any[] = [];
    if (list.length) {
      createNewFilterdArry(list).forEach((item) => {
        if (!CountyList.includes(item.country)) {
          CountyList.push(item.country);
        }
      });
    }
    setsearchResults(CountyList);
  }

  function createNewFilterdArry(data: any[]) {
    let newData: { country: any; year: any; yield: any }[] = [];

    if (data != undefined)
      data.forEach((item) => {
        newData.push({
          country: item.country,
          year: item.year,
          yield: item.maize_yield,
        });
      });

    return newData;
  }

  async function initSciChart(Data: any[]) {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create(
      "scichart-root",
      {
        theme: new SciChartJsNavyTheme(),
        title: county + " Maize crop Yield 2015 and 2022",
        titleStyle: { fontSize: 22 },
      }
    );

    let xValues: any[] = [];
    let yValues: any[] = [];

    createNewFilterdArry(Data).forEach((item) => {
      xValues.push(item.year);
      yValues.push(item.yield);
    });

    // Create an XAxis and YAxis with growBy padding
    const growBy = new NumberRange(1, 1);
    sciChartSurface.xAxes.add(
      new NumericAxis(wasmContext, { axisTitle: "Years", growBy })
    );
    sciChartSurface.yAxes.add(
      new NumericAxis(wasmContext, { axisTitle: "Yield", growBy })
    );

    // Create a line series with some initial data
    sciChartSurface.renderableSeries.add(
      new FastLineRenderableSeries(wasmContext, {
        stroke: "steelblue",
        strokeThickness: 3,
        dataSeries: new XyDataSeries(wasmContext, {
          xValues: xValues,
          yValues: yValues,
        }),
        pointMarker: new EllipsePointMarker(wasmContext, {
          width: 11,
          height: 11,
          fill: "#fff",
        }),
        animation: new SweepAnimation({ duration: 300, fadeEffect: true }),
      })
    );
   // Add the ZoomPanModifier to enable zooming and panning
   sciChartSurface.chartModifiers.add(new ZoomPanModifier());

   // ZoomExtents to fit the chart to the viewport
   sciChartSurface.zoomExtents();
    return sciChartSurface;
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-semibold mb-4">
          Search County See Their Year Maize crop Yield From 2015 and 2022
        </h1>
        <input
          type="text"
          placeholder="Search..."
          className=" rounded p-2 w-full mb-4 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className="divide-y divide-gray-300">
        {searchResults.map((item, index) => (
          <li
            onClick={() => selectCounty(item)}
            key={index}
            className="p-4 text-white"
          >
            {item}
          </li>
        ))}
      </ul>
      <div className="flex place-items-center">
        <div
          className="rounded"
          id="scichart-root"
          style={{ width: "100%", height: "400px" }}
        />
      </div>
    </>
  );
};

export default SciChart;

//   // Create the pie chart
//   const sciChartPieSurface = await SciChartPieSurface.create("scichart-root", {
//     theme: new SciChartJsNavyTheme(),
//     pieType: EPieType.Pie,
//       animate: true,
//       seriesSpacing: 15,
//       showLegend: true,
//       showLegendSeriesMarkers: true,
//       animateLegend: true
//   };

//   // SciChart.js expects a list of PieSegment, however data is often formatted like this
//   // Dataset = 'percentage market share of phones, 2022'\\
//   console.log(data);
//   const dataset = [
//     { name: "South Africa", percent: 28.41 },
//     { name: "Zimbabwe", percent: 28.21 },
//     { name: "Angola", percent: 12.73 },
//     { name: "Namibia", percent: 5.27 },

//   ];
//   // Colors are just hex strings, supporting #FFFFFF (RBG) or 8-digit with RGBA or CSS color strings e.g. rgba()
//   const colors = [
//       { color1: '#228fda', color2: '#228fda' },
//       { color1: '#5fa8db', color2: '#9caf88' },
//       { color1:'#95c6e8', color2: '#c2def2' },
//       { color1: '#c2def2', color2: '#cbdce7' },
//   ];

//   // Optional Relative radius adjustment per segment
//   const radiusSize = [0.8, 0.8, 0.8, 0.96];

//   const toPieSegment = (name: string, value: number, radiusAdjustment: number, color1: string, color2?: string) => {
//       return new PieSegment({
//           value,
//           text: name,
//           labelStyle: { color:'#ffff' },
//           radiusAdjustment,
//           showLabel: value > 2,
//           colorLinearGradient: new GradientParams(new Point(0, 0), new Point(0, 1), [
//               { color: color1, offset: 0 },
//               { color: color2 ?? color1 + "7", offset: 1 }
//           ])
//       });
//   };

//   // Transform the data to pie segment and add to scichart
//   const pieSegments = dataset.map((row, index) =>
//       toPieSegment(row.name, row.percent, radiusSize[index], colors[index].color1, colors[index].color2)
//   );

//   sciChartPieSurface.pieSegments.add(...pieSegments);

//   return sciChartPieSurface;
// };

// import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import "./Home.css";
import { getDatabase, ref, child, get, set } from "firebase/database";
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};

// export const data = {
//   labels,
//   datasets: [
//     {
//       label: 'Dataset 1',
//       data: metrics,
//       borderColor: 'rgb(255, 99, 132)',
//       backgroundColor: 'rgba(255, 99, 132, 0.5)',
//     },
//     // {
//     //   label: 'Dataset 2',
//     //   data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//     //   borderColor: 'rgb(53, 162, 235)',
//     //   backgroundColor: 'rgba(53, 162, 235, 0.5)',
//     // },
//   ],
// };


function Home() {
  const [metrics, setMetrics] = useState([]);
  const [labels, setLabels] = useState([]);
  // const [thresholds, setThresholds] = useState([]);
  const [lightThreshold, setLightThreshold] = useState();
  const [moistureThreshold, setMoistureThreshold] = useState();

  const data = {
    labels,
    datasets: [
      {
        label: 'Light',
        data: metrics,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ],
  }
  
  async function getMetrics(){
    const dbRef = ref(getDatabase());
    get(child(dbRef, `device01/metrics/LDR`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        parseMetrics(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  async function getThresholds(){
    const dbRef = ref(getDatabase());
    get(child(dbRef, `device01/thresholds`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        parseThresholds(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  function parseMetrics(metricsObject){
    let metricsTemp = Object.values(metricsObject).map(metric => metric.LDRvalue).filter(x => x !== undefined);
    let labelsTemp = Object.values(metricsObject).filter(x => x.ts !== undefined).map(metric => new Date(metric.ts).toLocaleString('en-GB'));
    setMetrics(metricsTemp);
    setLabels(labelsTemp);
  }

  function parseThresholds(thresholdsObject){
    let thresholdsTemp = Object.entries(thresholdsObject);
    setLightThreshold(thresholdsTemp[0][1]);
    setMoistureThreshold(thresholdsTemp[1][1]);

  }

  function handleSubmit(event){
    const dbRef = ref(getDatabase());
    let formData = {
      'light': parseFloat(lightThreshold),
      'moisture': parseFloat(moistureThreshold)
    }
    set(child(dbRef, '/device01/thresholds'), formData);
  }

  function handleLightInput(event){
    setLightThreshold(event.target.value);
  }

  function handleMoistureInput(event){
    setMoistureThreshold(event.target.value);
  }

  useEffect(()=>{
    getMetrics();
    getThresholds();
  }, []);
  
  return(
    <div className="main-container">
          <div className="header">
            <h1 className="display-4 mx-1 mt-2">Plantstat</h1>
            <button type="button" className="set-threshold-btn btn btn-info" data-toggle="modal" data-target="#myModal">Setup alerts</button>
          </div>
          <hr/>
        {/* {metrics.map((metric, index)=> {
          <p>Metric: {{metric}}</p>
        })} */}

    <div className="chart-container mx-auto">
      <Line width={50} height={40} options={options} data={data}/>
    </div>


    <div id="myModal" className="modal fade" role="dialog">
      <div className="modal-dialog">

        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Setup alerts</h4>
            <button type="button" className="close" data-dismiss="modal">&times;</button>
          </div>
          <div className="modal-body">
            <p>Edit thresholds for sensor alerts</p>
            <div className="modal-alerts-container">
                <div className="input-container">
                  <label>Light</label>
                  <input type="number" value={lightThreshold} className="threshold-input" onChange={handleLightInput}/>
                </div>
                <div className="input-container">
                  <label>Moisture</label>
                  <input type="number" value={moistureThreshold} className="threshold-input" onChange={handleMoistureInput}/>
                </div>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={handleSubmit} type="button" className="btn btn-success" data-dismiss="modal">Submit</button>
          </div>
        </div>

      </div>
    </div>

    </div>
  )
}

export default Home;
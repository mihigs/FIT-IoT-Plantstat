// import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { getDatabase, ref, child, get } from "firebase/database";
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

  function parseMetrics(metricsObject){
    let metricsTemp = Object.values(metricsObject).map(metric => metric.LDRvalue).filter(x => x !== undefined);
    let labelsTemp = Object.values(metricsObject).filter(x => x.ts !== undefined).map(metric => new Date(metric.ts).toLocaleString('en-GB'));
    setMetrics(metricsTemp);
    setLabels(labelsTemp);
  }

  useEffect(()=>{
    getMetrics();
  }, []);
  
  return(
    <div className="main-container">
        <div className="jumbotron">
          <h1 className="display-4">Plantstat</h1>
          <p className="lead"></p>
          <hr className="my-4"/>
        </div>
        {/* {metrics.map((metric, index)=> {
          <p>Metric: {{metric}}</p>
        })} */}

    <Line width={50} height={40} options={options} data={data}/>

    </div>
  )
}

export default Home;
import Inventory from "./pages/inventory";
import Goods from "./pages/goods";

export const routes=[
{path:'', element:<Inventory/>},
{path:'inventory', element:<Inventory/>},
{path:'*', element:<Goods/>},
{path:'goods-receive-note', element:<Goods/>}




]
 //   supplyDetails: [
      //     {
      //       itemCode: "13100002",
      //       itemDesc: "TONER1",
      //       UOM: "BOX",
      //       brand: "Beautesoft",
      //       linkCode: "",
      //       barCode: "",
      //       range: "TONER",
      //       onHandQty: "74",
      //     },
      //     {
      //       itemCode: "13100002",
      //       itemDesc: "TONER2",
      //       UOM: "BOX",
      //       brand: "Beautesoft",
      //       linkCode: "",
      //       barCode: "",
      //       range: "TONER",
      //       onHandQty: "74",
      //     },
      //     {
      //       itemCode: "13100002",
      //       itemDesc: "TONER3",
      //       UOM: "BOX",
      //       brand: "Beautesoft",
      //       linkCode: "",
      //       barCode: "",
      //       range: "TONER",
      //       onHandQty: "74",
      //     },
      //   ],
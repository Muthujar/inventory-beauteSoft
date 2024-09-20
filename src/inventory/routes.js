import Inventory from "./pages/inventory";
import Goods from "./pages/goods";

export const routes=[
{path:'', element:<Goods/>},
{path:'inventory', element:<Inventory/>},
{path:'*', element:<Goods/>},
{path:'goods-receive-note', element:<Goods/>},
{path:'goods-transfer-in', element:<Inventory/>},
{path:'goods-transfer-out', element:<Inventory/>}

]    


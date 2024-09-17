import React, { Component } from "react";
import Select from "react-select";
import Table from "../components/table";
import { Modal } from "bootstrap";
import Apiservice from "../constants/apiservice";
import { queryParamsGenerate, stockHdrs } from "../utils";
import withRouter from "../components/withRouter";

class AddInventory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      slicedDetails: [],
      stockHdrs: {
        docNo: "",
        docDate: "",
        docStatus: 0,
        supplyNo: "",
        docRef1: "",
        docRef2: "",
        docTerm: "",
        storeNo: "BeateSoft salon",
        docRemk1: "",
        postDate: "",
        createUser: "kk",
      },
      stockList: [],
      stockHdrsDetails: [],
      controlDatas: {
        docNo: "",
        RunningNo: "",
      },
      activeTab: "detail",

      supplyList: [],
      supplyOptions: [],

      supplyPagination: {
        limit: 5,
        page: 1,
        total: null,
        name: "",
        hideLimit: true,
      },

      cartData: [],
      showModal: false,
      totalCart: {
        qty: null,
        amt: null,
      },
      showSpinner: false,
      editIndex: null,
      editData: {
        itemRemark: "",
        docQty: "",
        docPrice: "",
      },
      filter: {
        movCode: "GRN",
        splyCode: "",
        docNo: "",
        // fields: { itemCode: true, itemDesc: true },
      },

      supplierInfo: {
        Attn: "",
        line1: "",
        line2: "",
        line3: "",
        sline1: "",
        sline2: "",
        sline3: "",
        pcode: "",
        spcode: "",
      },
      errors: {},
      showErrorToast: false,
      errorMessage: "",
    };
  }
  async componentDidMount() {
    console.log(this.props);
    if (this.props.docNo) {
      const filter = {
        movCode: "GRN",
        docNo: this.props.docNo,
      };
      //   this.setState((prevState) => ({
      //     filter: {
      //       ...prevState.filter,
      //       docNo: this.props.docNo,
      //       movCode:''
      //     },
      //   }));
      await this.getStockHdr(filter);
      await this.getStockHdrDetails(filter);
      await this.getSupplyList(this.state.stockHdrs.supplyNo);
    } else {
      const today = new Date().toISOString().split("T")[0];
      this.setState((prevState) => ({
        stockHdrs: {
          ...prevState.stockHdrs,
          docDate: today,
        },
      }));

      await this.getDocNo();
      await this.getSupplyList();
      await this.getStockDetails();
    }

    this.pageLimit();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.supplyPagination.limit !== this.state.supplyPagination.limit ||
      prevState.supplyPagination.page !== this.state.supplyPagination.page ||
      prevState.supplyPagination.total !== this.state.supplyPagination.total ||
      prevState.supplyPagination.name !== this.state.supplyPagination.name
    ) {
      this.pageLimit();
    }
    if (prevState.cartData.length !== this.state.cartData.length)
      this.calcTotalAmount();
    if (prevState.stockHdrs.supplyNo !== this.state.stockHdrs.supplyNo) {
      console.log(prevState.stockHdrs.supplyNo);

      this.setSupplierInfo();
    }
  }

  componentWillUnmount() {
    this.setState({ stockHdrs: stockHdrs });
  }

  setSupplierInfo() {
    const { stockHdrs, supplyList } = this.state;
    const data = supplyList.find(
      (item, i) => stockHdrs.supplyNo === item.splyCode
    );

    this.setState({
      supplierInfo: {
        Attn: data?.splyAttn,
        line1: data?.splyAddr1,
        line2: data?.splyAddr1,
        line3: data?.splyAddr1,
        pcode: data?.splyPoscd,
        sline1: data?.splymaddr1,
        sline2: data?.splymaddr2,
        sline3: data?.splymaddr3,
        spcode: data?.splymposcd,
      },
    });
  }

  routeList() {
    console.log(this.state.stockHdrs, "stockHdrs");
    console.log(this.state.cartData, "cartdata");
    console.log(this.state.totalCart, "totalCart");
    console.log(this.state.supplyPagination, "pagina");

    // this.props.history.push('/goods-receive-note');
    this.props.navigate("/goods-receive-note?list");
  }

  getStockHdr = async (filter) => {
    try {
      const response = await Apiservice().getAPI(
        `StkMovdocHdrs${queryParamsGenerate(filter ?? this.state.filter)}`
      );

      const docDate = new Date(response[0]?.docDate)
        .toISOString()
        .split("T")[0];
      const postDate = new Date(response[0]?.postDate)
        .toISOString()
        .split("T")[0];
      // const docAmt=response[0].docAmt.toFixed(2)
      // const docQty=response[0]?.docQty
      const data = response[0];

      const docAmt = data?.docAmt;
      const docQty = data?.docQty;

      console.log(docAmt, typeof docAmt, docAmt.length, "docamt");

      this.setState({
        stockHdrs: {
          ...response[0],
          docDate: docDate,
          postDate: postDate,
        },
        showSpinner: false,
        totalCart: {
          ...this.state.totalCart,
          amt: docAmt,
          qty: docQty,
        },
      });

      this.pageLimit();
    } catch (err) {
      console.error(err); // handle error appropriately
    }
  };

  // Convert getStockHdrDetails to async
  getStockHdrDetails = async (filter) => {
    try {
      const response = await Apiservice().getAPI(
        `StkMovdocDtls${queryParamsGenerate(filter ?? this.state.filter)}`
      );

      this.setState({
        cartData: response,
        showSpinner: false,
      });

      this.pageLimit();
    } catch (err) {
      console.error(err); // handle error appropriately
    }
  };

  async getSupplyList(supplycode) {
    try {
      const res = await Apiservice().getAPI(
        `ItemSupplies${queryParamsGenerate(this.state.filter)}`
      );

      const supplyOption = res
        .filter((item) => item.splyCode)
        .map((item) => ({
          label: item.supplydesc,
          value: item.splyCode,
        }));

      this.setState((prevState) => ({
        supplyList: res,
        supplyOptions: supplyOption,
        stockHdrs: {
          ...prevState.stockHdrs,
          supplyNo: supplycode ? supplycode : supplyOption[0]?.value || null, // Set default to first option's value if it exists
        },
        supplyPagination: {
          ...prevState.supplyPagination,
          total: prevState.stockHdrsDetails.length,
        },
        showSpinner: false,
      }));
    } catch (err) {
      // Handle the error
      console.error("Error fetching supply list:", err);
    }
  }

  async getDocNo() {
    try {
      // Await the API call
      const codeDesc = "Goods Receive Note";
      const siteCode = "MCHQ";
      const res = await Apiservice().getAPI(
        `ControlNos?filter={"where":{"and":[{"controlDescription":"${codeDesc}"},{"siteCode":"${siteCode}"}]}}`
      );
      console.log(res);
      if (!res) return;
      const docNo = res[0].controlPrefix + res[0].siteCode + res[0].controlNo;
    //   const docNo = res[0].controlPrefix + res[0].siteCode + 110050

      console.log(docNo, "docno");
      this.setState((prevState) => ({
        stockHdrs: {
          ...prevState.stockHdrs,
          docNo: docNo,
        },
        controlDatas: {
          docNo: docNo,
          RunningNo: res[0].controlNo,
        },

        showSpinner: false,
      }));
      //   this.pageLimit();
    } catch (err) {
      // Handle the error
      console.error("Error fetching supply details:", err);
    }
  }

  async addNewControlNumber() {
    try {
      const { controlDatas } = this.state;

      const controlNo = controlDatas.RunningNo;

      const newControlNo = (parseInt(controlNo, 10) + 1).toString();

      const controlNosUpdate = {
        controldescription: "Goods Receive Note",
        sitecode: "MCHQ",
        controlnumber: newControlNo, // Set the incremented control number
      };

      const api = "ControlNos/updatecontrol";
      const response = await Apiservice().postAPI(api, controlNosUpdate);

      if (!response) return; // Handle the case where the response is empty or null

      console.log("Control number updated successfully", response);

      // this.setState((prevState) => ({
      //   stockHdrs: {
      //     ...prevState.stockHdrs,
      //     docNo: newControlNo,
      //   },
      //   showSpinner: false,
      // }));
    } catch (err) {
      // Handle any errors during the API call
      console.error("Error updating control number:", err);
    }
  }

  async getStockDetails() {
    try {
      // Await the API call
      const res = await Apiservice().getAPI(
        `PackageItemDetails${queryParamsGenerate(this.state.filter)}`
      );

      console.log(typeof res[0].item_Price);
      const updatedRes = res.map((item) => ({
        ...item,
        Qty: 0,
        Price: Number(item?.item_Price),
        docAmt: null,
      }));
      // Update the state with the response
      this.setState((prevState) => ({
        stockList: updatedRes,
        supplyPagination: {
          ...prevState.supplyPagination,
          total: res.length,
        },
        showSpinner: false,
      }));

      // Call pageLimit (assuming this function handles pagination)
      this.pageLimit();
    } catch (err) {
      // Handle the error
      console.error("Error fetching supply details:", err);
    }
  }

  pageLimit = () => {
    const { supplyPagination, stockList, stockHdrsDetails } = this.state;
    // console.log(stockList, "su");
    let startIndex = (supplyPagination.page - 1) * supplyPagination.limit;
    let endIndex = startIndex + supplyPagination.limit;
    const filtered = stockList?.slice(startIndex, endIndex);
    this.setState({
      slicedDetails: filtered,
    });
  };

  optionClick(event, type) {
    console.log(event);

    this.setState((prevState) => ({
      stockHdrs: {
        ...prevState.stockHdrs,
        supplyNo: event.value,
      },
      filter: {
        ...prevState.filter,
        splyCode: event.value,
      },
    }));
  }

  validateForm = () => {
    const { stockHdrs, supplierInfo, cartData, totalCart } = this.state;
    let errors = {};
    let formIsValid = true;

    // stockHdrs validations
    if (!stockHdrs.docNo) {
      formIsValid = false;
      errors["Docno"] = "Document number is required";
    }

    if (!stockHdrs.docDate) {
      formIsValid = false;
      errors["docDate"] = "Document date is required";
    }

    if (!stockHdrs.supplyNo) {
      formIsValid = false;
      errors["supplyNo"] = "Supply number is required";
    }

    if (!stockHdrs.docTerm) {
      formIsValid = false;
      errors["docTerm"] = "Document term is required";
    }

    if (!stockHdrs.postDate) {
      formIsValid = false;
      errors["postDate"] = "Post date is required";
    }

    // SupplierInfo validations
    // if (!supplierInfo.Attn) {
    //   formIsValid = false;
    //   errors["Attn"] = "Attention field is required";
    // }

    // if (!supplierInfo.line1) {
    //   formIsValid = false;
    //   errors["line1"] = "Address Line 1 is required";
    // }

    // if (!supplierInfo.pcode) {
    //   formIsValid = false;
    //   errors["pcode"] = "Postal code is required";
    // }

    // if (!supplierInfo.spcode) {
    //   formIsValid = false;
    //   errors["spcode"] = "Supplier postal code is required";
    // }

    if (cartData.length === 0) {
      formIsValid = false;
      errors["cart"] = "cart shouldn't be empty";
    }

    this.setState({ errors });
    console.log(formIsValid, this.state.errors);

    // Show toast if form is invalid
    if (!formIsValid) {
      console.log(this.state.errors);
      this.setState({
        showErrorToast: true,
        errorMessage: "Please fill all required fields.",
      });
    }

    return formIsValid;
  };

  async postStockDetails() {
    const { cartData } = this.state; // Assuming cartData contains the data to be updated
    let data = [...cartData];
    console.log(data, "data for editing");

    try {
          const item = data[0];
          if (item.docId) {
            for (let i = 0; i < data.length; i++) {
                let body=data[i]
          //   const res = await Apiservice().patchAPI(`StkMovdocDtls/update?[where][docId]=${item.docId}`, item);
            const res = await Apiservice().patchAPI(`StkMovdocDtls/${item.docId}`, body);
  
            console.log(res, `Updated item with docId: ${item.docId}`);
            }
          } else {
            const res = await Apiservice().postAPI("StkMovdocDtls", data);
            console.log(res, "Created new item");
          //   this.addNewControlNumber(); // Call other necessary functions
          //   this.pageLimit();
        }
  
    // try {
    //   
    //     const item = data[i];
    //     if (item.docId) {
    //     //   const res = await Apiservice().patchAPI(`StkMovdocDtls/update?[where][docId]=${item.docId}`, item);
    //       const res = await Apiservice().patchAPI(`StkMovdocDtls/${item.docId}`, item);

    //       console.log(res, `Updated item with docId: ${item.docId}`);
    //     } else {
    //       const res = await Apiservice().postAPI("StkMovdocDtls", item);
    //       console.log(res, "Created new item");
    //     }
    //   }
  
      // After all updates/creates
      this.setState({
        showSpinner: false,
      });
  

    } catch (err) {
      console.error("Error during edit or create:", err); // handle the error
    }
  }

//   async postStockDetails() {
//     const { stockHdrsDetails, cartData } = this.state;
//     let data = [...cartData];
//     console.log(data, "data stock h det post");
//     try {
//       const res = await Apiservice().postAPI("StkMovdocDtls", data);
//       console.log(res, "post");

//       this.setState({
//         showSpinner: false,
//       });

//       this.addNewControlNumber();
//       this.pageLimit();
//     } catch (err) {
//       console.error(err); // handle the error
//     }
//   }
  async postStockHdrDetails(data,type) {
    const { stockHdrsDetails, cartData } = this.state;
    // let data = [...cartData];
    console.log(data, "data stock h det post");
    if (type === "create") {
      try {
        const res = await Apiservice().postAPI("StkMovdocHdrs", data);
        console.log(res, "post");

        this.setState({
          showSpinner: false,
        });

        this.addNewControlNumber();
        this.pageLimit();
      } catch (err) {
        console.error(err); // handle the error
      }
    } else {
      try {
    //   const  res = await Apiservice().patchAPI(`StkMovdocHdrs/update?[where][docNo]=${data.docNo}`, data);
      const  res = await Apiservice().patchAPI(`StkMovdocHdrs/${data.poId}`, data);

        console.log(res, "patch");

        this.setState({
          showSpinner: false,
        });

        // this.addNewControlNumber();
        // this.pageLimit();
      } catch (err) {
        console.error(err); // handle the error
      }
    }
  }

  async onSubmit(e, type) {
    e.preventDefault();
    const { stockHdrs, supplierInfo, cartData, totalCart } = this.state;

    console.log(stockHdrs, "stockHdrs");
    console.log(cartData, "cartData");
    console.log(supplierInfo, "supplierInfo");

    if (this.validateForm()) {
      let data = {
        // ...stockHdrs,
        docNo: stockHdrs.docNo,
        movCode: "GRN",
        movType: "GRN",
        storeNo: stockHdrs.storeNo,
        // fstoreNo: null,
        // tstoreNo: null,
        supplyNo: stockHdrs.supplyNo,
        docRef1: stockHdrs.docRef1,
        docRef2: stockHdrs.docRef2,
        // accCode: null,
        // staffNo: null,
        docLines: null,
        docDate: stockHdrs.docDate,
        postDate: stockHdrs.postDate,
        docStatus: stockHdrs.docStatus,
        docTerm: stockHdrs.docTerm,
        // docTime: null,
        docQty: totalCart.qty,
        // docFoc: null,
        // docDisc: null,
        docAmt: totalCart.amt,
        // docTrnspt: null,
        // docTax: null,
        docAttn: supplierInfo.Attn,
        docRemk1: stockHdrs.docRemk1,
        // docRemk2: null,
        // docRemk3: null,
        // docShip: null,
        bname: supplierInfo.Attn,
        baddr1: supplierInfo.line1,
        baddr2: supplierInfo.line2,
        baddr3: supplierInfo.line3,
        bpostcode: supplierInfo.pcode,
        // bstate: null,
        // bcity: null,
        // bcountry: null,
        daddr1: supplierInfo.sline1,
        daddr2: supplierInfo.sline2,
        daddr3: supplierInfo.sline3,
        dpostcode: supplierInfo.spcode,
        // dstate: null,
        // dcity: null,
        // dcountry: null,
        // cancelQty: null,
        // recStatus: null,
        // recExpect: null,
        // recTtl: null,
        createUser: stockHdrs.createUser,
        createDate: null,
      }
      if (stockHdrs?.poId)data.poId=stockHdrs?.poId

      if (
        type === "save" &&
        !this.props?.docNo &&
        this.state.stockHdrs?.docStatus === 0
      ) {
        this.postStockHdrDetails(data, "create");
        this.postStockDetails();
      } else if (type === "save" && this.props.docNo) {
        this.postStockHdrDetails(data, "update");
        this.postStockDetails();

      } else if (type === "post" && this.props.docNo) {
        data={
            ...data,
            docStatus:7
        }
        this.postStockHdrDetails(data, "updateStatus");
        this.postStockDetails();

      }
    } else {
      console.log("Form is invalid, fix the errors and resubmit.");
    }
  }

  calcTotalAmount = () => {
    const Amount = this.state.cartData.reduce((acc, item) => {
      console.log(item.Qty, item);
      return acc + item.docQty * item.docPrice;
    }, 0);

    console.log(Amount, "amountttoal");
    const Quantity = this.state.cartData.reduce((acc, item) => {
      return acc + item.docQty; // Ensure Qty is a number or 0 if undefined
    }, 0);
    console.log(Quantity, "Quantity");

    this.setState({
      totalCart: {
        amt: Amount,
        qty: Quantity,
      },
    });
  };

  showWithDecimal(value) {
    return value;
  }

  changeTab = (event) => {
    this.setState({ activeTab: event });
  };

  addGoods = () => {};

  handlecalc = (e, index, type) => {
    const { value } = e.target;

    console.log(value, "value");

    // Convert to number if type is "Price", otherwise keep as is
    const newValue = Number(value);
    console.log(newValue, "newvalue");
    // Debugging logs
    console.log("Value before update:", value);
    console.log("New value to set:", newValue);

    // Update the stockList array immutably
    const updatedStockList = structuredClone(this.state.slicedDetails);

    // const updatedStockList = this.state.stockList.map((item, i) => {
    //   if (i === index) {
    //     console.log("Updating item at index:", i);
    //     return { ...item, [type]: newValue };
    //   }
    //   return item;
    // });

    console.log(updatedStockList[index], "updated");
    updatedStockList[index] = {
      ...updatedStockList[index],
      [type]: newValue,
    };

    console.log("Updated stockList:", updatedStockList);

    // Set the updated state
    this.setState({ slicedDetails: updatedStockList }, () => {
      // Callback to ensure state update has been applied
      console.log("State after setState:", this.state.slicedDetails);
    });
  };

  handleDateChange = (e, type) => {
    console.log(e);
    this.setState({
      stockHdrs: {
        ...this.state.stockHdrs,
        [type]: e.target.value,
      },
    });
  };

  handleDateChange2 = (e, type) => {
    console.log(e);
    this.setState({
      supplierInfo: {
        ...this.state.supplierInfo,
        [type]: e.target.value,
      },
    });
  };

  updatePagination = (newPagination) => {
    this.setState((prevState) => ({
      supplyPagination: {
        ...prevState.supplyPagination,
        ...newPagination,
      },
    }));
  };
  handleCloseModal() {
    document.getElementById("exampleModal").classList.remove("show", "d-block");
    document
      .querySelectorAll(".modal-backdrop")
      .forEach((el) => el.classList.remove("modal-backdrop"));
  }

  onSave = () => {

    const { cartData, editData, editIndex } = this.state;
    let updatedCart = [...cartData];
    let updated = { ...updatedCart[editIndex], ...editData };
    updatedCart[editIndex] = updated;
    console.log(updatedCart[editIndex], "obj");
    console.log(updatedCart, "updated");

    this.setState({
      cartData: updatedCart,
    });
    // this.setState({showModal:false})
    this.handleCloseModal();

    // console.log(cartData,'ca')
    // const modalElement = document.getElementById('exampleModal');
    // const modal = Modal.getInstance(modalElement);
    // modal?.hide();
  };

  editPopup = (item, i) => {
    console.log(item);
    this.setState({ showModal: true });
    this.setState({
      editData: {
        itemRemark: item?.Remarks ?? "", // Fallback to empty string if Remarks is null or undefined
        docQty: item?.docQty ?? "", // Fallback to empty string if Qty is null or undefined
        docPrice: item?.docPrice ?? "", // Fallback to empty string if Price is null or undefined
      },
      editIndex: i, // Set the index in the same state update
    });
  };

  onEditCart = (e, type) => {
    let value = e.target.value;

    console.log(value);
    //     const { cartData, editIndex } = this.state;
    // let updatedCartData=[...cartData]

    //     let editData = {...updatedCartData[editIndex]}
    //     editData[type]=value
    //     updatedCartData[editIndex] = editData;
    //     this.setState({
    //         cartData:updatedCartData
    //     })

    this.setState((prevState) => ({
      editData: {
        ...prevState.editData,
        [type]: value,
      },
    }));
  };

  onDeleteCart = (item, i) => {
    const { cartData } = this.state;
    const data = cartData.filter((cart, index) => index !== i);

    this.setState({ cartData: data });
  };

  addToCart = (i) => {
    const { stockList, controlDatas, cartData, slicedDetails } = this.state;
    console.log(stockList[i], "stocklist");
    console.log(slicedDetails[i], "stocklist");

    console.log(cartData, "cartData");

    let item = slicedDetails[i];
    if (item.Qty === 0) return window.alert("quantity should not be empty");
    console.log(cartData, "cartdata");
    console.log(item, "item");

    const amount = item.Qty * item.Price;

    let idCart = {
      //   ...item,
      id: i + 1,
      docAmt: amount,
      docNo: controlDatas.docNo,
      movCode: "GRN",
      movType: "GRN",
      docLineno: null,
      docDate: "",
      grnNo: "",
      refNo: "",
      itemcode: item.stockCode,
      itemdesc: item.stockName,
      itemprice: null,
      docUomtype: "",
      docUomqty: 0,
      docQty: item.Qty,
      docFocqty: 0,
      docTtlqty: item.Qty,
      docPrice: item.Price,
      docMdisc: "",
      docPdisc: 0,
      docDisc: 0,
      //   docAmt: 0,
      recQty1: 0,
      recQty2: 0,
      recQty3: 0,
      recQty5: 0,
      recTtl: 0,
      postedQty: 0,
      cancelQty: 0,
      ordMemo1: "",
      ordMemo2: "",
      ordMemo3: "",
      ordMemo4: "",
      createUser: "KK",
      createDate: "",
      docUom: item.itemUom,
      docExpdate: "",
      docBatchNo: "",
      phyNo: "",
      itmBrand: item.brandCode,
      itmRange: item.rangeCode,
      itmBrandDesc: item.brand,
      itmRangeDesc: "",
      DOCUOMDesc: item.itemUom,
      stkAdjReasonCode: "",
      itemRemark: "",
      // docId: 0
    };

    const itemExists =
      cartData.length > 0 &&
      cartData.find((data, index) => {
        console.log(data?.id, idCart.id);
        if (idCart?.id === data?.id) {
          const shoulAdd = window.confirm(
            `Item has already been added to the cart at position ${
              index + 1
            }. Do you want to add it again?`
          );
          return !shoulAdd;
        }

        return false;
      });

    console.log(itemExists);
    if (!itemExists) {
      console.log(itemExists);

      let cart = {
        ...idCart,
        // id: i + 1,
      };
      console.log(cart);

      this.setState((prevState) => ({
        cartData: [...prevState.cartData, cart],
      }));
    } else {
      // let cart = {
      //     ...item,
      //     id: i + 1,
      //   };
      //   console.log(cart);
      //   this.setState((prevState) => ({
      //     cartData: [...prevState.cartData, cart],
      //   }));
    }
    console.log(cartData, "cartdata");
  };

  render() {
    const {
      activeTab,
      stockHdrs,
      showSpinner,
      cartData,
      supplyPagination,
      stockHdrsDetails,
      totalCartAmount,
      editIndex,
      editData,
      showModal,
      slicedDetails,
      supplyOptions,
      supplierInfo,
      showErrorToast,
      errorMessage,
      totalCart,
    } = this.state;
    const headerDetails = [
      {
        label: "Item Code",
        sortKey: "Doc Number",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "Item Description",
        sortKey: "Invoice Date",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "UOM",
        sortKey: "Ref Num",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "Brand",
        sortKey: "Supplier",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "Link Code",
        sortKey: "Total Amount",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "BarCode",
        sortKey: "Status",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "Range",
        sortKey: "Print",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "On Hand Qty",
        sortKey: "Print",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "Qty",
        sortKey: "Print",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "Price",
        sortKey: "Print",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
      {
        label: "",
        sortKey: "",
        enabled: true,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "justify-content-end",
      },
    ];

    const cartHeader = [
      {
        label: "",
        // divClass: "justify-content-end",
      },
      {
        label: "",
        // divClass: "justify-content-end",
      },
      {
        label: "No",
        divClass: "justify-content-end",
      },
      {
        label: "Item Code",
        divClass: "justify-content-end",
      },
      {
        label: "Description",
        divClass: "justify-content-end",
      },
      {
        label: "Brand",
        divClass: "justify-content-end",
      },
      {
        label: "Range",
        divClass: "justify-content-end",
      },
      {
        label: "U.Cost",
        divClass: "justify-content-end",
      },
      {
        label: "UOM",
        divClass: "justify-content-end",
      },
      {
        label: "Qty",
        divClass: "justify-content-end",
      },
      {
        label: "Amount",
        divClass: "justify-content-end",
      },
      {
        label: "Remark",
        divClass: "justify-content-end",
      },
      {
        label: "",
        divClass: "justify-content-end",
      },
      {
        label: "Action",
        divClass: "justify-content-end",
      },
      {
        label: "",
        // divClass: "justify-content-end",
      },
      {
        label: "",
        // divClass: "justify-content-end",
      },
    ];
    const Storeoptions = [
      { value: "MC01", label: "Chocolate" },
      { value: "MCHQ", label: "Strawberry" },
      { value: "MCHQ", label: "Vanilla" },
    ];
    const statusOption = [
      { value: 0, label: "Open" },
      { value: 7, label: "Posted" },
    ];

    const userOption = [
      { value: "kk", label: "KK" },
      { value: "Muthuraj", label: "Muthuraj" },
    ];

    return (
      <div className="add-container">
        <div className="box-in">
          <div className="row-in">
            <div className="section-div">
              <div className="inText">
                Doc No<span className="red-mand">*</span>
              </div>
              <input
                value={stockHdrs.docNo}
                className="input-field"
                type="text"
                disabled
              ></input>
            </div>
            <div className="section-div">
              <div className="inText">
                Doc Date <span className="red-mand">*</span>
              </div>
              <input
                value={stockHdrs.docDate}
                disabled
                type="date"
                className="input-field"
              ></input>
            </div>
            <div className="section-div">
              <div className="inText">
                Status <span className="red-mand">*</span>
              </div>
              <Select
                value={statusOption.find(
                  (option) => option.value === stockHdrs.docStatus
                )}
                className="select-field"
                isDisabled={true}
                options={statusOption}
                onChange={(e) => this.optionClick(e, "docStatus")}
              />

              {/* <input
                value={stockHdrs.docStatus}
                className="input-field"
                type="string"
                disabled
              ></input> */}
            </div>
          </div>
          <div className="row-in">
            <div className="section-div">
              <div className="inText">
                Supply No <span className="red-mand">*</span>
              </div>
              <Select
                value={supplyOptions.find(
                  (option) => option.value === stockHdrs.supplyNo
                )}
                // Set the selected value
                placeholder="Select Supply No"
                className="select-field"
                options={supplyOptions}
                onChange={(e) => this.optionClick(e, "supplyNo")}
              />
            </div>
            <div className="section-div">
              <div className="inText">
                Delivery Date <span className="red-mand">*</span>
              </div>
              <input
                value={stockHdrs.postDate}
                className="input-field"
                type="date"
                onChange={(e) => this.handleDateChange(e, "postDate")}
              ></input>
            </div>
            <div className="section-div">
              <div className="inText">
                Term <span className="red-mand">*</span>
              </div>
              <input
                value={stockHdrs.docTerm}
                className="input-field"
                type="string"
                onChange={(e) => this.handleDateChange(e, "docTerm")}
              ></input>
            </div>
          </div>
          <div className="row-in">
            <div className="section-div">
              <div className="inText">GR Ref 1</div>
              <input
                value={stockHdrs.docRef1}
                placeholder="Enter GR Ref 1"
                className="input-field"
                type="string"
                onChange={(e) => this.handleDateChange(e, "docRef1")}
              ></input>
            </div>
            <div className="section-div">
              <div className="inText">GR Ref 2</div>
              <input
                value={stockHdrs.docRef2}
                placeholder="Enter GR Ref 2"
                className="input-field"
                type="string"
                onChange={(e) => this.handleDateChange(e, "docRef2")}
              ></input>
            </div>
            <div className="section-div">
              <div className="inText">
                Store Code <span className="red-mand">*</span>
              </div>
              <input
                value={stockHdrs.storeNo}
                placeholder="Enter Store Code"
                className="input-field"
                type="string"
                onChange={(e) => this.handleDateChange(e, "storeNo")}
              ></input>
              {/* <Select className="select-field" options={options}/> */}
            </div>
          </div>
          <div className="row-in">
            <div className="section-div">
              <div className="inText">
                Created By <span className="red-mand">*</span>
              </div>
              {/* <input className="input-field"  type="string"></input> */}
              <Select
                // value={stockHdrs.createUser}
                className="select-field"
                options={userOption}
                value={userOption.find(
                  (option) => option.value === stockHdrs.createUser
                )}
                isDisabled={true}
              />
            </div>
            <div className="section-div">
              <div className="inText">Remark</div>
              <input
                value={stockHdrs.docRemk1}
                placeholder="Enter Remarks"
                className="input-field1"
                type="string"
                onChange={(e) => this.handleDateChange(e, "docRemk1")}
              ></input>
            </div>
            {/* <div>
                        <div>Status*</div>
                        <input type='string'></input>
                    </div> */}
          </div>
        </div>
        <div className="box-detail">
          <div className="tabBox">
            <div
              onClick={() => this.changeTab("detail")}
              className={`tab ${activeTab === "detail" ? "active" : ""}`}
            >
              Detail
            </div>
            <div
              onClick={() => this.changeTab("supplier")}
              className={`tab ${activeTab === "supplier" ? "active" : ""}`}
            >
              Supplier Info
            </div>
          </div>

          {activeTab === "detail" ? (
            <div className="tab-detail">
              {!this.props.docNo && slicedDetails?.length > 0 && (
                <div className="detail-filter">
                  <div className="section-div ">
                    <input
                      checked={true}
                      className="input-check"
                      type="checkbox"
                    ></input>
                    <label className="ml-3">Retail Product</label>
                  </div>
                  <div className="section-div ml-3 ">
                    <input
                      checked={true}
                      className="input-check"
                      type="checkbox"
                    ></input>
                    <label className="ml-3">Salon Product</label>
                  </div>
                  <div className="section-div ml-2">
                    <input
                      placeholder="Enter Brand"
                      className="input-field ml-8"
                      type="string"
                    ></input>
                  </div>
                  <div className="section-div ml-8">
                    <input
                      placeholder="Enter Range"
                      className="input-field"
                      type="string"
                    ></input>
                  </div>
                  <div className="section-div ml-8">
                    <input
                      placeholder="Search by item Code "
                      className="input-field a"
                      type="string"
                    ></input>
                  </div>
                </div>
              )}

              <div className="table-detail">
                {!this.props.docNo && slicedDetails?.length > 0 ? (
                  <Table
                    headerDetails={headerDetails}
                    pagination={supplyPagination}
                    updatePagination={this.updatePagination}
                  >
                    {showSpinner ? (
                      <tr>
                        <td>hgh</td>
                      </tr>
                    ) : slicedDetails?.length > 0 ? (
                      slicedDetails.map((item, i) => {
                        return (
                          <tr>
                            <td>{item.stockCode}</td>
                            <td>{item.stockName}</td>
                            <td>{item.itemUom}</td>
                            <td>{item.brand}</td>
                            <td>{item.linkCode}</td>
                            <td>{item.brandCode}</td>
                            <td>{item.range}</td>
                            <td>{item.quantity}</td>
                            <td className="text-start">
                              <input
                                type="number"
                                className="input-s"
                                value={item.Qty}
                                onChange={(e) => this.handlecalc(e, i, "Qty")}
                              ></input>
                            </td>
                            <td>
                              <input
                                value={item.Price}
                                type="number"
                                className="input-s"
                                onChange={(e) => this.handlecalc(e, i, "Price")}
                              ></input>
                            </td>
                            <td
                              onClick={() => this.addToCart(i)}
                              className="cursor-pointer"
                            >
                              <i class="bi bi-hand-index"></i>
                            </td>
                          </tr>
                        );
                      })
                    ) : null}
                  </Table>
                ) : (
                  ""
                )}

                {cartData.length > 0 ? (
                  <div className="mt-3">
                    <Table headerDetails={cartHeader}>
                      {cartData.map((item, i) => {
                        return (
                          <tr>
                            <td>{}</td>
                            <td>{}</td>
                            <td>{i + 1}</td>
                            <td>{item.itemcode}</td>
                            <td>{item.itemdesc}</td>
                            <td>{item.itmBrandDesc}</td>
                            <td>{item.itmRangeDesc}</td>
                            <td>{item.docPrice}</td>
                            <td>{item.docUom}</td>
                            <td>{item.docQty}</td>
                            <td>{item.docAmt}</td>
                            <td>{item?.Remarks ?? ""}</td>
                            <td
                              className="cursor-pointer"
                              //   onClick={() => this.onEditCart(item, i)}
                            >
                              {
                                <i
                                  data-toggle="modal"
                                  data-target="#exampleModal"
                                  class="bi bi-pencil-fill"
                                  onClick={() => this.editPopup(item, i)}
                                ></i>
                              }
                            </td>
                            <td
                              onClick={() => this.onDeleteCart(item, i)}
                              className="cursor-pointer"
                            >
                              <i class="bi bi-trash"></i>{" "}
                            </td>
                            <td>{}</td>
                            <td>{}</td>
                          </tr>
                        );
                      })}
                    </Table>

                    <div className="total-div">
                      <div className="txt">Total Cost</div>
                      <input
                        value={totalCart?.amt}
                        // readOnly
                        disabled
                        type="number"
                      ></input>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ) : (
            <div className="tab-supply">
              <div className="row-in">
                <div className="section-div">
                  <div className="inText">
                    Attn To<span className="red-mand">*</span>
                  </div>
                  <input
                    value={supplierInfo.Attn}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "Attn")}
                  ></input>
                </div>
              </div>

              <div className="row-in">
                <div className="section-div">
                  <div className="inText">
                    Address<span className="red-mand">*</span>
                  </div>
                  <input
                    value={supplierInfo.line1}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "line1")}
                  ></input>
                </div>
                <div className="section-div">
                  <div className="inText">
                    Ship To Address<span className="red-mand">*</span>
                  </div>
                  <input
                    value={supplierInfo.sline1}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "sline1")}
                  ></input>
                </div>
              </div>
              <div className="row-in">
                <div className="section-div">
                  <input
                    value={supplierInfo.line2}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "line2")}
                  ></input>
                </div>
                <div className="section-div">
                  <input
                    value={supplierInfo.sline2}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "sline2")}
                  ></input>
                </div>
              </div>
              <div className="row-in">
                <div className="section-div">
                  <input
                    value={supplierInfo.line3}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "line3")}
                  ></input>
                </div>
                <div className="section-div">
                  <input
                    value={supplierInfo.sline3}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "sline3")}
                  ></input>
                </div>
              </div>
              <div className="row-in">
                <div className="section-div">
                  <div className="inText">
                    Post Code<span className="red-mand">*</span>
                  </div>
                  <input
                    value={supplierInfo.pcode}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "pcode")}
                  ></input>
                </div>
                <div className="section-div">
                  <div className="inText">
                    Post Code<span className="red-mand">*</span>
                  </div>
                  <input
                    value={supplierInfo.spcode}
                    className="input-field"
                    type="string"
                    onChange={(e) => this.handleDateChange2(e, "spcode")}
                  ></input>
                </div>
              </div>
            </div>
          )}
        </div>
        {showErrorToast && (
          <div
            className="toast show align-items-center text-bg-danger border-0"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">{errorMessage}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => this.setState({ showErrorToast: false })}
              ></button>
            </div>
          </div>
        )}

        <div
          className={`modal fade show`} // Apply 'show' and 'd-block' classes conditionally
          id="exampleModal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
          // className="modal show d-block"
          //   tabindex="1"

          // role="dialog"
          // aria-labelledby="exampleModalLabel"
          // aria-hidden="false"
          /* Set to false to ensure it's always shown */
        >
          <div
            className="modal-dialog modal-dialog-centered show"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  Edit Qty/Price
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row-in">
                  <div className="section-div">
                    <div className="inText">Qty</div>
                    <input
                      onChange={(e) => this.onEditCart(e, "docQty")}
                      value={editData.docQty}
                      className="input-field"
                      type="string"
                    ></input>
                  </div>
                  <div className="section-div ml-4">
                    <div className="inText">
                      Price<span className="red-mand">*</span>
                    </div>
                    <input
                      onChange={(e) => this.onEditCart(e, "docPrice")}
                      value={editData.docPrice}
                      className="input-field"
                      type="string"
                    ></input>
                  </div>
                </div>

                <div className="remark-div">
                  <div className="inText">Remarks</div>
                  <input
                    onChange={(e) => this.onEditCart(e, "itemRemark")}
                    value={editData.itemRemark}
                    className="input-field"
                    type="string"
                  ></input>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => this.onSave()}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="onSave-div">
          <div
            onClick={(e) => {
              this.onSubmit(e, "save");
            }}
            className={`btn save ${stockHdrs.docStatus===7 &&'disabled'} `}
          >
            Save
          </div>
          <div
            onClick={(e) => {
              this.onSubmit(e, "post");
            }}
            className={`btn post ${stockHdrs.docStatus===7 || !this.props.docNo ?'disabled':''} `}
          >
            Post
          </div>
          <div onClick={() => this.props.routeto()} className="btn list">
            List
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(AddInventory); // Wrap your class component with withRouter

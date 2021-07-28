var dateoverride = {
  openOverrideEditor: function () {
      if(document.querySelector(".mainContainer").style.display == "none"){
        document.querySelector(".mainContainer").style.display = "block";
      }else{
        document.querySelector(".mainContainer").style.display = "none";
      }
  }
}
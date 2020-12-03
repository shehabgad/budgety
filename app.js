// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (element) {
      sum += element.value;
    });
    data.totals[type] = sum;
    return sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };
  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // ID = last ID + 1;

      // Create new ID
      if (data.allItems[type].length == 0) {
        ID = 0;
      } else {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      // Create new ID
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else {
        newItem = new Income(ID, des, val);
      }
      // Push it into our data structure
      data.allItems[type].push(newItem);

      // return new element
      return newItem;
    },
    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // calculate the budget: income - expences
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    deletItem: function (type, id) {
      // id = 3'
      var ids, index;

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
    calculatePercentages: function () {
      data.allItems.exp.forEach(function (curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    testing: function () {
      console.log(data);
    },
  };
})();

// UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  var formatNumber = function (num, type) {
    var numSplit, int, dec, sign;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }

    dec = numSplit[1];

    type === "exp" ? (sign = "-") : (sign = "+");
    return sign + " " + int + "." + dec;
  };
  var NodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getinput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;
      //  Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div> </div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
      }
      // Replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function (selectorID) {
      // document
      //   .getElementById(selectorID)
      //   .parentNode.removeChild(document.getElementById(selectorID));
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    GetDOMstrings: function () {
      return DOMstrings;
    },
    DisplayMonth: function () {
      var now, year, month, months;
      now = new Date();
      // var christman = new Date(2020, 11, 25);
      year = now.getFullYear();
      month = now.getMonth();
      months = [
        "janurary",
        "feburary",
        "march",
        "april",
        "may",
        "june",
        "july",
        "augest",
        "september",
        "october",
        "novermber",
        "december",
      ];
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    DisplayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : "exp";
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    DisplayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      NodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
      NodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  var setupEvenetListeners = function () {
    var DOM = UICtrl.GetDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };
  var updateBudget = function () {
    // 1. Calculate the budget
    budgetController.calculateBudget();
    // 2. return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budger on the UI
    UICtrl.DisplayBudget(budget);
  };
  var uptadePercentages = function () {
    // 1. calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. read percentage from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3. update UI with the new percentages
    UICtrl.DisplayPercentages(percentages);
    console.log(percentages);
  };
  var ctrlAddItem = function () {
    // 1. Get field input data
    var input = UICtrl.getinput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add the item to the budget controller
      var newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4. clear the fields
      UICtrl.clearFields();

      // 5. calculate and uptade budget
      updateBudget();
      // 6. calculate and update percentages
      uptadePercentages();
    }
  };
  var ctrlDeleteItem = function (event) {
    var ItemId, splitID, type, ID;
    ItemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (ItemId) {
      // inc-1
      splitID = ItemId.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1.delete the item from data structure
      budgetCtrl.deletItem(type, ID);
      // 2. delete the item from UI
      UICtrl.deleteListItem(ItemId);
      //3. update and show the new budget
      updateBudget();
      // 4. update and show percentages
      uptadePercentages();
    }
  };
  return {
    init: function () {
      console.log("application started ");
      UIController.DisplayMonth();
      updateBudget();
      setupEvenetListeners();
    },
  };
})(budgetController, UIController);

controller.init();

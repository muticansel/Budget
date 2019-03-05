var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function (type) {
        sum = 0;
        data.allItems[type].forEach(curr => {
            sum += curr.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function () {
            calculateTotal('inc');
            calculateTotal('exp');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            else
                data.percentage = -1;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalsInc: data.totals.inc,
                totalsExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    }
})();

var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        btnAdd: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expense__list',
        budgetValue: ".budget__value",
        budgetIncValue: ".budget__income--value",
        budgetExpValue: ".budget__expenses--value",
        percentage: ".budget__expenses--percentage"
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id)
                .replace('%value%', obj.value)
                .replace('%description%', obj.description);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((curr, i, arr) => {
                curr.value = ""
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            debugger;
            document.querySelector(DOMStrings.budgetValue).textContent = obj.budget;
            document.querySelector(DOMStrings.budgetIncValue).textContent = obj.totalsInc;
            document.querySelector(DOMStrings.budgetExpValue).textContent = obj.totalsExp;
            if(obj.percentage > 0)
                document.querySelector(DOMStrings.percentage).textContent = obj.percentage + "%";
            else
                document.querySelector(DOMStrings.percentage).textContent = "---";
        },
        getDOMStrings: function () {
            return DOMStrings;
        }
    }
})();

var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListener = function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.btnAdd).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        })
    };

    var updateBudget = function() {
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        input = UICtrl.getInput();

        if (input.description && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();

            updateBudget();
        }
    };

    return {
        init: function () {
            setupEventListener();
            UICtrl.displayBudget({
                budget: 0,
                totalsInc: 0,
                totalsExp: 0,
                percentage: -1
            })
        }
    }
})(budgetController, UIController);

controller.init();
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    Expense.prototype.calculatePercentage = function (totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round(this.value / totalInc * 100);
        }
        else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
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
        calculatePercentages: function () {
            data.allItems.exp.forEach(curr => {
                curr.calculatePercentage(data.totals.inc);
            })
        },
        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(curr => {
                return curr.getPercentage()
            })

            return allPercentages;
        },
        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(item => {
                return item.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        getBudget: function () {
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
        percentage: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var formatNumber = function(value, type) {
        var numSplit, int, dec, type;

        num = Math.abs(value);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++)
            callback(list[i], i)
    };

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
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>'
            }

            newHtml = html.replace('%id%', obj.id)
                .replace('%value%', formatNumber(obj.value, type))
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
        deleteListItem: function (selectId) {
            var element = document.getElementById(selectId);
            element.parentNode.removeChild(element)
        },
        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(obj.budget, obj.budget > 0 ? 'inc' : 'exp');
            document.querySelector(DOMStrings.budgetIncValue).textContent = formatNumber(obj.totalsInc, 'inc');
            document.querySelector(DOMStrings.budgetExpValue).textContent = formatNumber(obj.totalsExp, 'exp');
            if (obj.percentage > 0)
                document.querySelector(DOMStrings.percentage).textContent = obj.percentage + "%";
            else
                document.querySelector(DOMStrings.percentage).textContent = "---";
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
    
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---'
            });
        },
        displayDate: function(){
            var now, months;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.querySelector(DOMStrings.dateLabel).textContent = months[now.getMonth()] + ' ' + now.getFullYear();
        },
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields, (cur) => {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMStrings.btnAdd).classList.toggle('red');
        },
        getDOMStrings: function () {
            return DOMStrings;
        }
    }
})();

var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListener = function () {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.btnAdd).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        })

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    var updatePercentages = function () {
        budgetCtrl.calculatePercentages();

        var percentages = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(percentages); 
    }

    var updateBudget = function () {
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        input = UICtrl.getInput();

        if (input.description && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();

            updateBudget();

            budgetCtrl.calculatePercentages();

            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            budgetCtrl.calculatePercentages();

            updatePercentages();
        }
    };

    return {
        init: function () {
            setupEventListener();
            UICtrl.displayDate();
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
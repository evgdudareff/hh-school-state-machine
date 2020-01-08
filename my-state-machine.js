export { machine, useContext, useState };

const machine = data => {
  return new Machine(data);
};

//Для сохранения контекста машины состояний используем массив.
//Позволяет сохранять и вынимать последний созданный контекст инстанса машины состояний
let ctx = [];

function Machine(data) {
  this.id = data.id;
  this.state = data.initialState;
  this.context = data.context;
  this.states = data.states;
  this.actionsDescription = data.actions;

  //Метод: запуск action/actions
  this.doAction = function(action, event) {
    const actionType = action.constructor;

    //В зависиомсти от типа action - провести запуск
    if (actionType === String) {
      this.actionsDescription[action](event);
    } else if (actionType === Function) {
      action(event);
    } else if (actionType === Array) {
      action.forEach((action, event) => {
        this.doAction(action, event);
      });
    } else {
      console.log("Action должен быть типа String, Function или Array!");
      return;
    }
  };

  //Метод запуска service (всегда функция)
  this.doService = function(service, event) {
    //Проверим, что сервис задан функцией
    if (service.constructor !== Function) {
      console.log("Service должен быть функцией!");
      return;
    }

    service(event);
  };

  //Метод: произвести переход
  this.transition = function(transition, data) {
    //1. Проверить, есть ли требуемая транзакция для текущего состояния
    if (!transition in this.states[this.state].on) {
      console.log(
        `Для текущего состояние транзация ${transition} не предусмотрена`
      );
      return;
    }

    //2. Сохраним контекст текущей машины состояний (доступен из замыкания)
    ctx.pop();
    ctx.push(this);

    //3.1 При наличии сервиса - выполнить его
    const service = this.states[this.state].on[transition].service;
    if (service) {
      this.doService(service, event);
    } else {
      //3.2 При отсутствии сервиса - перейти в указанный target
      const target = this.states[this.state].on[transition].target;
      const [state, setState] = useState();
      setState(target);
    }
  };
}

//Функция: возвращает текущий контекст и позволяет его изменить
function useContext() {
  const currentContext = ctx[ctx.length - 1];
  let currentContextObj = currentContext.context;

  //вернуть [текущий контекст, сеттер для контекста]
  return [
    currentContextObj,
    mergeContextObj => Object.assign(currentContextObj, mergeContextObj)
  ];
}

//Функция: возвращает текущее состояние и позволяет его изменить
function useState() {
  const currentContext = ctx[ctx.length - 1];

  function setState(newState) {
    let currentStateObj = currentContext.states[currentContext.state];

    //Выполнить все требуемые actions при выходе/входе из/в состояния/е
    //-проверить, есть ли action onExit:
    if ("onExit" in currentStateObj) {
      currentContext.doAction(currentStateObj["onExit"], event);
    }

    //Обновить состояние
    currentContext.state = newState;
    currentStateObj = currentContext.states[currentContext.state];

    //-проверить, есть ли action onEntry:
    if ("onEntry" in currentStateObj) {
      currentContext.doAction(currentStateObj["onEntry"], event);
    }
  }

  //вернуть [текущий стейт, сеттер для стейта]
  return [currentContext.state, setState];
}

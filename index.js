import { machine, useContext, useState } from "./my-state-machine";

// machine — создает инстанс state machine (фабрика)
const vacancyMachine = machine({
  // У каждого может быть свой id
  id: "vacancy",
  // начальное состояние
  initialState: "notResponded",
  // дополнительный контекст (payload)
  context: { id: 123 },
  // Граф состояний и переходов между ними
  states: {
    // Каждое поле — это возможное состояние
    responded: {
      // action, который нужно выполнить при входе в это состояние. Можно задавать массивом, строкой или функцией
      onEntry: "onStateEntry"
    },
    notResponded: {
      // action, который нужно выполнить при выходе из этого состояния. Можно задавать массивом, строкой или функцией
      onExit() {
        console.log("we are leaving notResponded state");
      },

      // Блок описания транзакций
      on: {
        // Транзакция
        RESPOND: {
          // упрощенный сервис, вызываем при транзакции
          service: event => {
            // Позволяет получить текущий контекст и изменить его
            const [context, setContext] = useContext();

            // Позволяет получить текущий стейт и изменить его
            const [state, setState] = useState();
            // Поддерживаются асинхронные действия
            window
              .fetch({
                method: "post",
                data: {
                  // resume: event.resume, vacancyId: context.id */
                }
              })
              .then(() => {
                // меняем состояние
                setState("responded");
                // Мержим контекст
                setContext({ completed: true }); // {id: 123, comleted: true}
              });
          }
          // Если не задан сервис, то просто переводим в заданный target, иначе выполняем сервис.
          //target: "responded"
        }
      }
    }
  },
  // Раздел описание экшенов
  actions: {
    onStateEntry: event => {
      const [state] = useState();
      console.log("now state is " + state);
    },
    makeResponse: event => {
      // both sync and async actions
      const [context, setContext] = useContext();
      window.fetch({
        method: "post",
        data: { resume: event.resume, vacancyId: context.id }
      });
    }
  }
});

// Пример использования StateMachine
vacancyMachine.transition("RESPOND", {
  resume: { name: "Vasya", lastName: "Pupkin" }
});

// var global = 'torres';

// function first(){
//     var outer = 'rooney'; //자신 수명이 끝나는 first 함수 호출 후에도 살아있음
//     function second(){    
//         var inner = 'messi';
//         console.log(global);
//         console.log(outer);
//         console.log(inner);
//     }
//     return second; //함수내에 정의한 second함수를 반환 하여 total 변수에 저장
// }
// var total = first() //반환 받은것이 사실상 클로저
// total()

// // first 함수 내에 정의한 지역변수인 inner가 자신이 수명이 끝나는 first 호출후에
// // total(); 호출에도 살아있다는 것이 특징;

// // 클로저는 자신을 포함하고 있는 외부 함수의 인자, 지역변수 등을 외부 함수가 종료된
// // 후에도 사용할 수있음 이러한 변수를 자유변수 라고 부름

// // 자유변수는 외부에서 직접 접근할 수는 없고 클로저를 통해서만 사용할 수 있음.

// // 즉, 자유변수를 가지는 코드를 클로저라 함


// //▶자바스크립트는 일급 함수를 지원하므로 함수를 변수에 저장하고,
// // 파라미터로 함수를 넘기고, 함수를 반환하는 것이 가능

// var counter = (function(){
//     var privateCount = 0;
//     function changeCount(v){
//         privateCount += v
//     }
//     return {
//         inc:function(){
//             changeCount(1)
//         },
//         dec:function(){
//             changeCount(-1)
//         },
//         val:function(){
//             return privateCount;
//         }
//     }
// })();
// counter.inc();
// counter.inc();
// console.log('increment:'+ counter.val());
// counter.dec();
// console.log('decrment:'+ counter.val());





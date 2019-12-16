// var arr = [4, 15, 377, 395, 400, 1024, 3000];
// var arr2 = arr.filter((n)=>{
//     return n % 5 == 0;
// })
// console.log(arr2)

var arr = [
    {x1: 1, x2: 1},
    {x1: 2, x2: 2},
    {x1: 3, x2: 3}
  ];
  var arr2 = null;
  
  // 정답
  arr2 = arr.map(function (obj) {
      return {
          x1: obj.x1, x2: obj.x2,
          result: obj.x1 * obj.x2
      };
  });

  console.log(arr2);
  
  



function rand(): number | string {
    if(Math.floor(Math.random() * 2)) {
        return 123;
    }
    else {
        return "456";
    }
}

const num = rand();
console.log(num);
if((num as string).length) {
    console.log("Asdf");
}
else {
    console.log("qwer");
}

export {}
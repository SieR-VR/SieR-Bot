export const formatNumber = (num: number) => {
    let res = num.toFixed(8).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    if(res.endsWith("00000000")) res = res.slice(0, res.length - 7);
    if(res.endsWith("0000000")) res = res.slice(0, res.length - 6);
    if(res.endsWith("000000")) res = res.slice(0, res.length - 5);
    if(res.endsWith("00000")) res = res.slice(0, res.length - 4);
    if(res.endsWith("0000")) res = res.slice(0, res.length - 3);
    if(res.endsWith("000")) res = res.slice(0, res.length - 2);
    if(res.endsWith("00")) res = res.slice(0, res.length - 1);
    return res;
}
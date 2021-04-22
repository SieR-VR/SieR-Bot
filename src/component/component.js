export const formatNumber = (num) => {
    let res = num.toFixed(8).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",", ",");
    if(res.endsWith("00000000")) res = res.slice(0, res.length - 7);
    return res;
}
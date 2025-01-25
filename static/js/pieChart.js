function d3PieChart(
    dataset, datasetBarChart
) {
    let selectedSlice = null;
    
    // 차트 마진 설정
    const margin = {
        top:20, right:20, bottom:20, left:20
    };

    // 차트 크기 설정
    const width = 350 - margin.left - margin.right,
          height = 350 - margin.top - margin.bottom;
    
    // 외부와 내부 반지름 설정
    outerRadius = Math.min(width, height) / 2,
    innerRadius = outerRadius * 0.5,

    // 색상 스케일 설정
    color = d3.scaleOrdinal(d3.schemeAccent);

    // SVG 요소 생성 및 "pieChart"에 추가
    const visualization = d3.select("#pieChart")
        .append("svg")
        .data([dataset])
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    // 파이 차트 데이터를 생성하는 함수
    const data = d3.pie()
        .sort(null)
        .value(function(d){ return d.value; })(dataset);

    // 외부 원형 차트를 생성하는 호(arc) 생성기 만들기
    const arc = d3.arc() 
        .outerRadius(outerRadius) 
        .innerRadius(0); 

    // 내부 원형 차트를 생성하는 호(arc) 생성기 만들기
    const innerArc= d3.arc() 
        .innerRadius(innerRadius) 
        .outerRadius(outerRadius);

    // 생성된 데이터 객체를 기반으로 파이 차트 조각 생성
    const arcs = visualization.selectAll("g.slice") 
        .data(data) 
        .enter() 
        .append("svg:g") 
        .attr("class", "slice") 
        .on("click", click) 
        .on("mouseover", function(event, d) { 
            if (selectedSlice !== this) { // 선택된 슬라이스가 아닐 경우에만 마우스 오버 적용 
                d3.select(this).select("text") 
                .transition() 
                .duration(200) 
                .style("font-size", "14px") 
                .style("fill", "black"); 
            } 
        }) 
        .on("mouseout", function(event, d) { 
            if (selectedSlice !== this) { // 선택된 슬라이스가 아닐 경우에만 마우스 아웃 적용
            d3.select(this).select("text") 
            .transition() 
            .duration(200) 
            .style("font-size", "11px") 
            .style("fill", "white"); 
        }
    }); 

    arcs.append("svg:path") // path 요소 생성
        .attr("fill", function(d, i) { return color(i); } ) // 색상 추가
        .attr("d", arc) // arc 그리기 함수를 사용하여 실제 SVG 경로 생성
        .append("svg:title") // 각 파이 차트 조각에 제목 추가
        .text(function(d) { return d.data.category + ": " + d.data.value + "%"; }); 

    d3.selectAll("g.slice") // 그룹화된 SVG 요소(piechart)에서 조각 선택
        .selectAll("path") 
        .transition() // 로딩 시 파이 차트 트랜지션 설정
        .duration(200) 
        .delay(5) 
        .attr("d", innerArc);

    arcs.filter(function(d) { return d.endAngle-d.startAngle> .1; }) // 특정 각도에서 조각 레이블 정의
        .append("svg:text") // SVG에 텍스트 영역 삽입
        .attr("dy", "0.20em") // 텍스트 내용의 위치를 y축을 따라 이동
        .attr("text-anchor", "middle") // 조각 레이블 위치 설정
        .attr("transform", function(d) { return "translate("+ innerArc.centroid(d) + ")"; }) // 트랜지션과 변환 시 위치 조정
        .text(function(d) { return d.data.category; }); // 조각에 카테고리 이름 추가

    visualization.append("svg:text") // 파이 차트 중앙에 차트 제목 추가
        .attr("dy", ".20em") 
        .attr("text-anchor", "middle") 
        .text("churned customers") 
        .attr("class","title"); 

    function click(d, i) { 
        // 이전 선택된 슬라이스가 있을 경우, 원래 상태로 되돌리기 
        if (selectedSlice !== null&& selectedSlice !== this) { 
            d3.select(selectedSlice).select("text") 
                .transition() 
                .duration(200) 
                .style("font-size", "11px") // Reset font size 
                .style("fill", "white"); // Reset text color 
        } 

        // 새로운 슬라이스 클릭 시, 해당 슬라이스에 스타일 적용 
        d3.select(this).select("text") 
            .transition() 
            .duration(200) 
            .style("font-size", "14px") // Keep enlarged text size 
            .style("fill", "black"); // Keep text color as black 

        selectedSlice= this; // 클릭된 슬라이스를 선택된 슬라이스로 저장 
        updateBarChart(d.data.category, color(i), datasetBarChart); // 바 차트 업데이트 
    } 
}

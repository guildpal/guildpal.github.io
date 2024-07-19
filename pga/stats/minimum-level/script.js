$(document).ready(function() {
    fetch('2024-07-17_minlevel.csv')
        .then(response => response.text())
        .then(data => {
            let parsedData = Papa.parse(data, {
                header: true, // CSV의 첫 번째 행을 헤더로 간주
                skipEmptyLines: true
            }).data;

            let tableData = parsedData.map(item => [
                item['skill'],
                item['pixel_earning'],
                item['min_level'],
                `<span><img src="${item['image_url']}" alt="${item['item_name']}" style="width:25px;height:25px;">${item['item_name']}</span>`,
                item['frequency'],
            ]);

            $('#minlevel').DataTable({
                data: tableData,
                columns: [
                    { title: "skill", className: "center-text" },
                    { title: "pixel earning", className: "center-text" },
                    { title: "minimum level", className: "center-text" },
                    { title: "example tasks", className: "center-text" },
                    { title: "frequency", className: "center-text" },
                ],
                pageLength: -1, // 한 페이지에 모든 데이터를 표시
                lengthMenu: [], // 'All' 옵션만을 제공
                dom: 'ft',
                language: { search: '' },
                initComplete: function() {
                    $('.dataTables_filter input').attr('placeholder', 'Search here...');
                }
            });
        })
        .catch(error => console.error('Error fetching the CSV data:', error));
});
import {
    Coffee,
    BarChart3,
    TrendingUp,
    BrainCircuit,
    Database,
    ShoppingBag,
    FlaskConical,
} from "lucide-react";
import cafeCleaningVideo from "../assets/projects/cafe/cafe-sales-data-cleaning.mp4";
import cafeDashboardVideo from "../assets/projects/cafe/cafe-dashboard.mp4";
import cafeFront from "../assets/projects/cafe/front.jpg";
import cafeReport from "../assets/projects/cafe/Cafe_Sales Analysis_Report.pdf";
import nikePowerQuery from "../assets/projects/nike/power-query.mp4";
import nikeDax from "../assets/projects/nike/dax-function.mp4";
import nikeDashboard from "../assets/projects/nike/nike-sales-dashboard.mp4";
import nikeFront from "../assets/projects/nike/front.jpg";
import nikeReport from "../assets/projects/nike/Nike Sales Performance Analysis Report.pdf";
import f1PythonSql from "../assets/projects/f1/python-sql.mp4";
import f1SqlFormulas from "../assets/projects/f1/sql-formulas.mp4";
import f1PitAvg from "../assets/projects/f1/clean-pit-avg.png";
import f1Dnf from "../assets/projects/f1/dnf-by-circuit.png";
import f1Pole from "../assets/projects/f1/pole-to-win.png";
import f1Comebacks from "../assets/projects/f1/top-comebacks.png";
import f1Front from "../assets/projects/f1/front.jpg";
import f1Report from "../assets/projects/f1/F1 Race Strategy and Performance Analysis Report.pdf";
import aiAnalysisVideo from "../assets/projects/ai/ai-analysis.mp4";
import aiChart1 from "../assets/projects/ai/chart1-correlation-heatmap.png";
import aiChart2 from "../assets/projects/ai/chart2-scatter-social-vs-mental.png";
import aiChart3 from "../assets/projects/ai/chart3-high-vs-low.png";
import aiFront from "../assets/projects/ai/front.jpg";
import aiReport from "../assets/projects/ai/Impact of AI and Social Media on Student Mental Health Report.pdf";
import riskVideo from "../assets/projects/financial-risk/risk-analysis.mp4";
import riskDashboard from "../assets/projects/financial-risk/dashboard.png";
import riskCredit from "../assets/projects/financial-risk/credit-score-segmentation.png";
import riskDti from "../assets/projects/financial-risk/dti-segmentation.png";
import riskExposure from "../assets/projects/financial-risk/potential-exposure.png";
import riskProperty from "../assets/projects/financial-risk/property-area-segmentation.png";
import riskFront from "../assets/projects/financial-risk/front.jpg";
import riskReport from "../assets/projects/financial-risk/Financial Risk Analysis and Loan Default Modelling Report.pdf";
import boatDashboard from "../assets/projects/boat/dashboard.png";
import boatFront from "../assets/projects/boat/front.jpg";
import boatReport from "../assets/projects/boat/boAt E-Commerce Sales Analytics Report.pdf";
import foodFront from "../assets/projects/food-inflation/front.jpg";
import foodReport from "../assets/projects/food-inflation/Effects of Food Inflation and Non-food Inflation on Agricultural Output Report.pdf";
import reconTesting from "../assets/projects/reconpro/reconpro-testing.mp4";
import reconFront from "../assets/projects/reconpro/front.jpg";
import websiteFront from "../assets/projects/website_salim/front.jpg";
import websiteWalkthrough from "../assets/projects/website_salim/video.mp4";

export const analyticsProjects = [
    {
        title: "Café Sales Performance & Data Quality Audit", category: "Sales Analytics", subtitle: "Microsoft Excel | Data Cleaning | Sales Analysis | Dashboard Development",
        technologies: ["Microsoft Excel"], icon: Coffee, number: "01", github: "https://github.com/salim-ibrahim/cafe-sales-performance-analysis", front: cafeFront, report: cafeReport,
        dataSource: { label: "Kaggle — Café Sales Dirty Data for Cleaning Training", url: "https://www.kaggle.com/datasets/ahmedmohamed2003/cafe-sales-dirty-data-for-cleaning-training" },
        sections: [
            { heading: "Project Overview", paras: ["How can a business make reliable decisions when its sales records contain missing and invalid information?", "This project analysed 10,000 café transactions to understand sales performance and identify data quality issues affecting business reporting.", "The objective was to determine which products, locations, and payment methods generated the most recorded revenue while highlighting areas where incomplete information limited the analysis."] },
            { heading: "The Business Challenge", paras: ["The transaction dataset contained ERROR, UNKNOWN, and blank entries across important fields, particularly Item, Payment Method, Location, and Transaction Date.", "Although the café had 10,000 transaction records, incomplete information made it difficult to obtain a complete picture of its sales performance."] },
            {
                heading: "My Approach", paras: ["Using Microsoft Excel, I completed an end-to-end analysis involving:"], approachSteps: [
                    { text: "Data cleaning: Standardised missing categorical values and handled invalid numeric entries without introducing artificial zeros.", media: { type: "video", src: cafeCleaningVideo, label: "Café sales data cleaning" } },
                    { text: "Data preparation: Converted recoverable transaction dates and preserved the original dataset." },
                    { text: "Data quality assessment: Developed a formula-based Data Quality Flag to identify incomplete transactions." },
                    { text: "Sales analysis: Used PivotTables to examine revenue by item, location, and payment method." },
                    { text: "Dashboard development: Created an interactive dashboard with KPI cards, PivotCharts, and slicers.", media: { type: "video", src: cafeDashboardVideo, label: "Café dashboard" } },
                ]
            },
            { heading: "Key Results", table: [["Total recorded revenue", "88,952.00"], ["Total transactions", "10,000"], ["Top identified product", "Salad"], ["Salad revenue", "17,320.00"], ["Salad contribution to revenue", "19.5%"], ["Revenue with unspecified location", "35,337.50"], ["Revenue with unspecified payment method", "27,775.00"]], paras: ["The analysis identified Salad as the highest revenue generating product. It also revealed substantial reporting gaps, particularly in transaction location and payment information."] },
            { heading: "Business Recommendations", paras: ["I recommended mandatory POS data fields, standardised dropdown options, improved date capture, regular data quality monitoring, and staff training to improve the completeness of future transaction records."] },
            { heading: "Tools and Skills Demonstrated", paras: ["Microsoft Excel: Data cleaning, COUNTIF, COUNTBLANK, IF, OR, ISBLANK, PivotTables, PivotCharts, slicers, KPI calculations, and interactive dashboard design.", "Analytical skills: Data quality assessment, descriptive analysis, business interpretation, and recommendation development."] },
        ],
    },
    {
        title: "NIKE SALES PERFORMANCE ANALYSIS", category: "Business Intelligence", subtitle: "Data Cleaning, Analysis and Interactive Dashboard Development Using Microsoft Power BI",
        technologies: ["Power BI"], icon: BarChart3, number: "02", github: "https://github.com/salim-ibrahim/nike-sales-performance-analysis", front: nikeFront, report: nikeReport,
        dataSource: { label: "Kaggle — Nike Sales Uncleaned Dataset", url: "https://www.kaggle.com/datasets/nayakganesh007/nike-sales-uncleaned-dataset" },
        sections: [
            { heading: "Project Overview", paras: ["This project involved cleaning, transforming and analysing a synthetic Nike retail sales dataset using Microsoft Power BI. The objective was to turn inconsistent and incomplete sales records into a structured dataset and an interactive dashboard that communicates key performance indicators, sales trends and product and customer segment insights.", "The project demonstrates how data preparation, analytical calculations and visual reporting can be combined to support clearer business understanding and more informed decision-making."] },
            { heading: "The Business Challenge", paras: ["The original dataset contained 2,500 records with several data quality problems that affected its reliability and usability. These included duplicate order IDs, missing values, inconsistent regional names, negative sales quantities, discounts exceeding 100%, and a Revenue column in which most recorded values were zero.", "Without addressing these issues, the dataset could produce misleading summaries and unreliable visualisations. The main challenge was therefore to improve the dataset's consistency and reconstruct revenue estimates before developing a meaningful sales performance dashboard."] },
            {
                heading: "My Approach", paras: ["I completed the project entirely in Microsoft Power BI, using Power Query for data cleaning and transformation, DAX for analytical measures, and Power BI visualisations for reporting.", "My work involved:"], approachSteps: [
                    { text: "Data quality assessment: Examined the dataset to identify missing values, duplicates, inconsistent entries and invalid numerical values." },
                    { text: "Data cleaning: Removed 114 duplicate Order_ID records, reducing the dataset from 2,500 to 2,386 records." },
                    { text: "Data standardisation: Consolidated inconsistent regional names into six standard city categories." },
                    { text: "Missing-value treatment: Applied median imputation to missing Units_Sold and MRP values, replaced missing discount values with zero, and labelled missing product sizes as “Not Specified”." },
                    { text: "Data validation: Capped discounts above 100% and treated negative sales quantities as missing values because their meaning could not be confirmed from the source." },
                    { text: "Revenue reconstruction: Recalculated revenue using units sold, product price and the applied discount because the original Revenue field was largely unreliable.", media: { type: "video", src: nikePowerQuery, label: "Power Query" } },
                    { text: "Analytical modelling: Created DAX measures to calculate total revenue, total profit, total units sold, average discount and profit margin.", media: { type: "video", src: nikeDax, label: "DAX functions" } },
                ]
            },
            { heading: "Dashboard & Analysis", paras: ["I developed a one-page interactive sales performance dashboard with a dark visual theme and orange accents. It combines KPI cards, charts, slicers and a regional map to present the analysis in an accessible format.", "The dashboard allows users to explore performance by sales channel and region, while examining revenue trends, product-line contributions and profit across gender categories."], media: [{ type: "video", src: nikeDashboard, label: "Nike sales dashboard" }] },
            { heading: "Key Results", paras: ["The final dashboard presents the following results:"], bullets: ["$23 million in recalculated revenue estimates.", "$3.3 million in recorded profit from the source dataset.", "14.5% derived profit margin.", "5,000 total units sold.", "49.7% Online and 50.3% Retail revenue contribution.", "Training recorded the highest product-line revenue, at approximately $5 million.", "The Women category recorded the highest profit among the gender categories, at approximately $1 million."] },
            { heading: "Business Insights", paras: ["These results are based on the cleaned dataset. Revenue is an estimate because median imputation was applied to missing price and quantity values, while profit was retained from the original dataset.", "The analysis showed a nearly balanced revenue contribution between Online and Retail channels, indicating that both channels are important to the dataset's overall sales performance.", "Training emerged as the leading product line by revenue, making it a useful area for further product-level investigation. The Women category also recorded the highest profit among the gender categories, providing a basis for further examination of product and customer-segment performance.", "The project also demonstrated how data quality problems can affect business reporting. Reconstructing revenue and standardising regional categories made the dataset more suitable for analysis, while retaining negative profit values preserved potentially important loss-making outcomes for further investigation."] },
            { heading: "Tools & Skills Demonstrated", paras: ["Tools: Microsoft Power BI Desktop, Power Query Editor and DAX.", "Skills: Data cleaning, data transformation, data quality assessment, missing-value treatment, duplicate removal, data standardisation, calculated measures, KPI development, sales analysis, dashboard design and data storytelling."] },
        ],
    },
    {
        title: "F1 RACE STRATEGY & PERFORMANCE ANALYSIS", category: "Data Analytics", subtitle: "Exploring Historical Formula 1 Performance Through SQL",
        technologies: ["SQL"], icon: TrendingUp, number: "03", github: "https://github.com/salim-ibrahim/f1-race-strategy-performance-analysis", front: f1Front, report: f1Report,
        dataSource: { label: "Kaggle — Formula 1 World Championship (1950–2020)", url: "https://www.kaggle.com/datasets/rohanrao/formula-1-world-championship-1950-2020" },
        sections: [
            { heading: "Project Overview", paras: ["This project uses historical Formula 1 data from 1950 to 2024 to investigate how pit-stop performance, qualifying position, circuit outcomes and driver recovery performances appear across race results.", "Working with approximately 701,000 records across 14 relational tables, I used Python to load the dataset into MySQL and SQL to conduct four focused analyses."] },
            { heading: "Business and Analytical Challenge", paras: ["Formula 1 race results contain more than finishing positions. They provide an opportunity to investigate constructor performance, the advantage of starting from pole position, differences in circuit-level outcomes and the ability of drivers to recover from difficult grid positions.", "The project translated these areas into four analytical questions:"], bullets: ["Which constructors recorded the fastest average clean pit-stop times?", "What proportion of pole-position entries resulted in victories?", "Which circuits recorded the highest rates of entries without a classified finishing position from 2010 onwards?", "Which drivers made the largest comebacks from outside the top ten to the podium?"] },
            { heading: "Approach", paras: ["I prepared the 14 supplied Excel sheets by replacing \\N markers with blanks and saving them as CSV files. Using Python, pandas, SQLAlchemy and PyMySQL, I created a MySQL database and loaded the CSV files into their respective tables.", "I then used MySQL Workbench to perform four SQL analyses involving table joins, conditional aggregation, filtering, grouping, calculated fields and ranking. Each analytical query was also implemented as a corresponding stored procedure for reuse.", "The resulting outputs were exported to Excel for review."], media: [{ type: "video", src: f1PythonSql, label: "Python – MySQL" }, { type: "video", src: f1SqlFormulas, label: "SQL formulas" }] },
            { heading: "Key Results", table: [["Constructor pit-stop performance", "Red Bull recorded the lowest average filtered pit-lane duration: 23.58 seconds"], ["Pole-to-win conversion", "42.34% of 1,136 pole-position entries resulted in victories"], ["Circuit finishing outcomes", "Mugello recorded a 40% rate of entries without a classified finishing position from 2010 onwards, based on 20 entries"], ["Driver comebacks", "Sebastian Vettel gained 21 positions at the 2012 Yas Marina Grand Prix, starting 24th and finishing third"]], charts: [{ src: f1PitAvg, label: "Clean pit averages", caption: "Constructor pit-stop performance." }, { src: f1Dnf, label: "DNF by circuit", caption: "Entries without a classified finishing position by circuit." }, { src: f1Pole, label: "Pole to win", caption: "Pole-position to victory conversion." }, { src: f1Comebacks, label: "Top comebacks", caption: "Largest position gains from outside the top ten to the podium." }] },
            { heading: "What the Analysis Revealed", paras: ["The findings demonstrate that starting from pole position does not guarantee a race victory, while constructor pit-lane performance and circuit-level finishing outcomes offer additional perspectives on historical race results.", "The comeback analysis also highlighted how drivers can recover from challenging grid positions. Sebastian Vettel's 2012 Yas Marina performance was the largest position gain identified under the project's criteria."] },
            { heading: "Tools and Technical Skills", paras: ["Tools: Python, pandas, SQLAlchemy, PyMySQL, MySQL 8.0, MySQL Workbench and Microsoft Excel.", "Technical skills: Database creation and loading, relational data handling, multi-table SQL joins, aggregate functions, conditional statements, data filtering, grouping, calculated fields, ranking and stored procedure development."] },
            { heading: "Project Limitations", paras: ["The analyses use different historical periods. The pit-stop comparison applies a 40-second threshold to exclude unusually long recorded durations, while the circuit analysis uses missing finishing positions as a proxy for unclassified outcomes. Some circuit results have small samples. The findings are descriptive and should not be interpreted as proof of cause and effect."] },
        ],
    },
    {
        title: "STUDENT DIGITAL WELLNESS ANALYSIS", category: "Data Analytics", subtitle: "Impact of AI & social media on Student Mental Health | Python",
        technologies: ["Python"], icon: BrainCircuit, number: "04", github: "https://github.com/salim-ibrahim/ai-social-media-student-mental-health-analysis", front: aiFront, report: aiReport,
        dataSource: { label: "Kaggle — AI and Social Media Impact: Student Health and Grades", url: "https://www.kaggle.com/datasets/srisyra02/ai-and-social-media-impact-student-health-and-grades" },
        sections: [
            { heading: "Project Overview", paras: ["This project explored how daily social media usage and AI tool usage relate to students’ mental and physical health. It also examined the relationships between sleep, physical activity and health outcomes.", "The analysis was designed from the perspective of a University Wellness Center seeking to better understand student digital habits and identify opportunities for wellness awareness initiatives."] },
            { heading: "Business Challenge", paras: ["With digital platforms and AI tools becoming increasingly integrated into students’ daily lives, understanding how technology usage relates to student well-being is an important area of interest.", "The project investigated three key questions:"], bullets: ["Is social media usage associated with mental health, sleep and physical health?", "Does AI tool usage show similar relationships with health outcomes?", "How are sleep and physical activity associated with mental and physical health?"] },
            { heading: "Approach", paras: ["Using Python, I conducted an exploratory analysis of a synthetic dataset containing 16,000 student records and 10 variables.", "The project involved:"], bullets: ["Inspecting the dataset for missing values, duplicate records and data types.", "Performing descriptive statistical analysis.", "Calculating Pearson correlation coefficients to examine relationships between digital habits and health outcomes.", "Segmenting students into high- and low-social-media-usage groups using percentile thresholds.", "Developing visualisations, including a correlation heatmap, scatter plot and group-comparison chart.", "Translating the findings into practical recommendations for student wellness initiatives."], media: [{ type: "video", src: aiAnalysisVideo, label: "AI analysis" }] },
            { heading: "Key Results", bullets: ["Social media and mental health: A moderate negative correlation of -0.40 was identified between daily social media usage and mental health scores.", "Social media and sleep: Daily social media usage had a negative correlation of -0.30 with sleep duration.", "AI tool usage: Its correlation with mental health was weaker at -0.11, with near-zero relationships with physical health and physical activity.", "High versus low usage: The low-social-media-usage group recorded an average mental health score of 76.92, compared with 67.44 in the high-usage group.", "Sleep and physical activity: Both showed positive associations with health outcomes, with physical activity having a +0.42 correlation with physical health scores."], charts: [{ src: aiChart1, label: "Chart 1 — Correlation heatmap", caption: "Correlations between digital habits and health outcomes." }, { src: aiChart2, label: "Chart 2 — Scatter: social vs mental", caption: "Daily social media usage vs mental health scores." }, { src: aiChart3, label: "Chart 3 — High vs low usage", caption: "High- vs low-social-media-usage group comparison." }] },
            { heading: "Recommendations", paras: ["The findings highlight opportunities for universities to strengthen digital-wellness awareness, promote healthy sleep habits and encourage regular physical activity. They also suggest that student wellness initiatives should take a balanced approach to AI tool usage rather than assume that all forms of digital engagement have the same relationship with health.", "These recommendations are exploratory because the dataset is synthetic and the analysis identifies associations rather than causal effects."] },
            { heading: "Tools and Skills Demonstrated", paras: ["Tools: Python, Pandas, NumPy, Matplotlib, Seaborn, Jupyter Notebook and VS Code.", "Skills: Data loading and inspection, data-quality assessment, descriptive statistics, correlation analysis, percentile-based segmentation, exploratory data analysis, data visualisation, interpretation of findings and business recommendations."] },
        ],
    },
    {
        title: "FINANCIAL RISK ANALYSIS & LOAN DEFAULT MODELLING", category: "Financial Analytics", subtitle: "Python | SQL | Machine Learning | Power BI",
        technologies: ["Python", "SQLite3", "Power BI"], icon: Database, number: "05", github: "https://github.com/salim-ibrahim/financial-risk-analysis-loan-default-modelling", front: riskFront, report: riskReport,
        dataSource: { label: "Kaggle — Financial Risk Analysis Dataset", url: "https://www.kaggle.com/datasets/jokimrodrigues/financial-risk-analysis-dataset" },
        sections: [
            { heading: "Project Overview", paras: ["Developed an end-to-end financial risk analysis project to examine a synthetic loan portfolio of 20,000 records. The project focused on identifying patterns across credit scores, debt-to-income ratios, repayment delays and property areas, while translating the analysis into an interactive Power BI dashboard.", "The work demonstrates practical skills in data preparation, portfolio segmentation, SQL analysis, exploratory machine learning and business-focused data visualisation."] },
            { heading: "Business Challenge", paras: ["Financial institutions need to understand where potential credit risk is concentrated within their loan portfolios. However, the dataset presented important quality issues, including missing financial information and an original default indicator that classified every record as a default.", "The challenge was to prepare the dataset for meaningful exploratory analysis, develop a usable risk indicator, investigate portfolio segments and present the findings in a format that supports risk monitoring."] },
            {
                heading: "Approach", numbered: [
                    "Data preparation and quality assessment — Python: Used Pandas and NumPy to inspect and clean the 20,000-record dataset. Addressed missing numerical values through median imputation, converted date fields and developed credit-score and debt-to-income categories.",
                    "Risk segmentation — SQL: Used SQL queries to compare flagged-default rates across property areas, credit-score bands and debt-to-income categories. This helped identify where the rule-generated risk flags were concentrated.",
                    { text: "Classification exercise — Random Forest: Applied a Random Forest classifier to explore how selected borrower and loan characteristics related to the constructed default indicator. The exercise also highlighted the importance of avoiding target leakage when developing predictive models.", media: { type: "video", src: riskVideo, label: "Risk analysis" } },
                    { text: "Interactive reporting — Power BI: Built a dashboard containing portfolio KPIs, segment-level comparisons and interactive slicers. Users can explore the results by credit band, DTI band, property area, payment delays and employment type.", media: { type: "image", src: riskDashboard, label: "Power BI dashboard" } },
                ]
            },
            { heading: "Key Results", bullets: ["20,000 loan records prepared and analysed.", "1,286 records flagged, representing 6.43% of the portfolio under the project's rule-based definition.", "21.30% flagged-default rate in the Poor credit-score segment.", "11.14% flagged-default rate in the High DTI segment.", "6.67% flagged-default rate in the Semiurban segment, compared with 6.35% for Urban and 6.27% for Rural loans.", "Approximately $50.95 million in loan amounts associated with flagged records.", "Developed an interactive Power BI dashboard to support portfolio exploration and comparison."], charts: [{ src: riskCredit, label: "Credit-score segmentation", caption: "Flagged-default rate by credit band." }, { src: riskDti, label: "DTI segmentation", caption: "Flagged-default rate by debt-to-income band." }, { src: riskProperty, label: "Property-area segmentation", caption: "Flagged-default rate by property area." }, { src: riskExposure, label: "Potential exposure", caption: "Loan amounts associated with flagged records." }], paras: ["An illustrative scenario calculated 80% of the flagged loan exposure as approximately $40.76 million. This is an assumed scenario, not verified savings or evidence of losses prevented."] },
            { heading: "Business Insights and Recommendations", paras: ["The segmentation results indicate that weaker credit scores, high debt burdens and repeated payment delays are useful areas for further investigation. Credit teams could use these indicators to guide more detailed affordability and repayment-history reviews.", "The analysis also demonstrates why data quality and target definition matter in financial modelling. The original default labels were unusable, so a rule-based indicator was created for exploratory purposes. Because the Random Forest used the same variables that generated this indicator, its reported 99.98% accuracy and 1.0 ROC-AUC are affected by target leakage and should not be interpreted as validated real-world predictive performance.", "A production-ready model would require verified historical default outcomes, independent validation and appropriate fairness and regulatory checks."] },
            { heading: "Tools and Technical Skills", bullets: ["Python: Pandas, NumPy, Scikit-learn and Matplotlib", "SQL: Portfolio segmentation, aggregation and risk-rate calculations", "Machine Learning: Random Forest classification exercise and model evaluation", "Power BI: DAX measures, KPI cards, bar charts and interactive slicers", "Git: Project version control"] },
        ],
    },
    {
        title: "boAt E-Commerce Sales Analytics", category: "E-Commerce Analytics", subtitle: "Revenue & Profitability Analysis | SQL, Python and Tableau",
        technologies: ["SQL", "Tableau"], icon: ShoppingBag, number: "06", github: "https://github.com/salim-ibrahim/-boat-ecommerce-sales-analytics", front: boatFront, report: boatReport,
        dataSource: { label: "Kaggle — boAt Sales Analytics Dataset (Arjun Gupta)", url: "https://www.kaggle.com/datasets/arjunguptadatanalyst/boat-sales-analytics-dataset-arjun-gupta" },
        sections: [
            { heading: "Project Overview", paras: ["Conducted an end-to-end e-commerce sales analytics project using a Kaggle dataset associated with boAt, analysing 975,000 sales transactions to uncover revenue patterns, product-category performance, sales-channel contributions, cancellation trends and festival-period activity.", "The project demonstrates the use of SQL for data cleaning and analysis, Python for database loading and data export, and Tableau for interactive business intelligence reporting."] },
            { heading: "Business Questions", bullets: ["How much revenue and profit were recorded across the sales transactions?", "Which product categories contributed most to total revenue?", "Which sales channels generated the highest revenue?", "What were the major reasons associated with cancelled orders?", "How did sales performance compare between festival and non-festival periods?"] },
            { heading: "Tools and Technical Skills", paras: ["MySQL: Database creation, data inspection, SQL-based cleaning, aggregation, joins and business analysis.", "Python: Pandas and MySQL Connector for loading CSV files into MySQL and exporting the cleaned sales table.", "Tableau: Interactive dashboard development, KPI presentation, calculated fields and visual analysis."] },
            { heading: "Key Findings", bullets: ["975,000 orders analysed across the main sales transaction table.", "$4,286.23 million in recorded net sales under the project's assumed USD reporting convention.", "$583.41 million in recorded profit, representing an overall profit margin of approximately 13.61%.", "True Wireless Earbuds led product-category revenue with approximately $1,545.91 million.", "Amazon India and Flipkart jointly contributed approximately 53% of total recorded revenue.", "15,785 orders were cancelled, representing approximately 1.62% of all orders.", "Cancelled transactions had approximately $70.84 million in associated net sales value.", "Non-festival transactions generated approximately $2,717.95 million in revenue, compared with approximately $1,568.28 million during festival periods."], media: [{ type: "image", src: boatDashboard, label: "boAt dashboard" }] },
            { heading: "Business Insights", paras: ["The analysis highlights the importance of monitoring product-category performance, understanding dependence on major marketplace channels and investigating operational issues associated with cancellations. It also provides a basis for evaluating product bundling opportunities and improving the measurement of promotional performance."] },
            { heading: "Project Outcome", paras: ["Delivered a structured SQL analysis workflow and an interactive Tableau dashboard that translate a large e-commerce dataset into accessible business performance insights.", "Core competencies demonstrated: SQL querying and data cleaning | Relational database management | Python data handling | Business analytics | KPI development | Tableau dashboard design | Data storytelling"] },
        ],
    },
    {
        title: "EFFECTS OF FOOD INFLATION & NON-FOOD INFLATION ON AGRICULTURAL OUTPUT IN GHANA", category: "Economics and Research", subtitle: "Inflation and Agricultural Output Analysis | Excel, Stata",
        technologies: ["Microsoft Excel", "Stata"], icon: FlaskConical, number: "07", github: "https://github.com/salim-ibrahim/food-nonfood-inflation-agricultural-output-ghana", front: foodFront, report: foodReport,
        dataSource: { label: "World Development Indicators, Ghana Statistical Service" },
        sections: [
            { heading: "Project Overview", paras: ["This project examined the relationship between food inflation, non-food inflation and agricultural output in Ghana. It investigated how changes in food and non-food prices relate to agricultural output in both the short run and long run, while accounting for other macroeconomic factors, including exchange rates, interest rates, input costs, GDP per capita and credit.", "The study was approached from an agricultural economics and macroeconomic policy perspective, seeking to understand how different dimensions of inflation interact with agricultural sector performance."] },
            { heading: "Research Challenge", paras: ["Inflation is an important macroeconomic concern in Ghana, but food and non-food inflation may have different implications for agricultural production.", "Understanding these relationships is important for policymakers seeking to maintain price stability while supporting agricultural productivity and economic growth.", "The research investigated three central questions:"], bullets: ["What are the relationships between food inflation, non-food inflation and agricultural output in Ghana?", "How do these relationships differ between the short run and the long run?", "How do other macroeconomic factors, including exchange rates, input costs, GDP per capita and credit, relate to agricultural output?"] },
            { heading: "Approach", paras: ["Using Microsoft Excel and Stata 17, I conducted a time-series econometric analysis using annual data covering 1991–2022 (32 observations).", "The project involved:"], bullets: ["Organising and preparing the annual macroeconomic and agricultural dataset.", "Conducting descriptive statistical analysis to examine the distribution and characteristics of the variables.", "Performing trend analysis to examine movements in inflation and agricultural output over time.", "Applying Augmented Dickey-Fuller and Phillips-Perron tests to assess the stationarity of the time-series variables.", "Estimating an Ordinary Least Squares (OLS) model to examine the relationships among the variables.", "Applying the Autoregressive Distributed Lag (ARDL) approach to investigate short-run and long-run relationships.", "Conducting ARDL bounds testing to assess the existence of a long-run relationship.", "Estimating an Error Correction Model (ECM) to examine short-run adjustments towards long-run equilibrium.", "Performing diagnostic and stability tests, including serial correlation, heteroskedasticity, functional-form and CUSUM-based stability assessments."] },
            { heading: "Key Results", bullets: ["Long-run food inflation: Food inflation had a positive and statistically significant long-run relationship with agricultural output, with an estimated coefficient of +1.2223.", "Long-run non-food inflation: Non-food inflation had a negative and statistically significant long-run relationship with agricultural output, with an estimated coefficient of -0.4451.", "Other macroeconomic factors: The long-run estimates showed negative relationships for the exchange rate (-46.0348) and positive relationships for input costs (+14.8332), GDP per capita (+25.7479) and credit (+50.7221), based on the model's specified transformations.", "Short-run relationships: Food inflation and exchange rate movements showed negative short-run relationships with agricultural output, while non-food inflation showed positive short-run relationships. Input costs and credit also showed negative short-run relationships in the estimated model.", "Long-run relationship: The ARDL bounds test produced an F-statistic of 19.819, providing evidence of a long-run relationship among the model variables.", "Adjustment towards equilibrium: The error correction coefficient was -0.9411 and statistically significant, suggesting that approximately 94.1% of the previous period's deviation from long-run equilibrium was corrected within one period."] },
            { heading: "Recommendations", paras: ["The findings highlight the importance of distinguishing between food and non-food inflation when assessing the relationship between price movements and agricultural output.", "Agricultural and macroeconomic policy should consider the different short-run and long-run relationships identified in the study. Attention should also be given to exchange-rate developments, agricultural input costs and access to credit when designing policies to support agricultural production.", "The findings should be interpreted cautiously as econometric relationships rather than proof of causation. The diagnostic tests also identified evidence of serial correlation in the estimated model, which should be considered when interpreting the results."] },
            { heading: "Tools and Skills Demonstrated", paras: ["Tools: Microsoft Excel, Stata 17.", "Skills: Data preparation, time-series data analysis, descriptive statistics, trend analysis, stationarity testing, OLS regression, ARDL modelling, bounds testing, error correction modelling, diagnostic testing, model stability assessment, econometric interpretation and policy recommendations."] },
            { heading: "Data Note", paras: ["Data note: The study used annual secondary data covering 1991–2022, compiled from sources including FAOSTAT, Ghana Statistical Service (GSS), ISSER and the World Development Indicators (WDI). The analysis examines statistical relationships within the study period and does not establish causal effects."] },
        ],
    },
];

export const featuredProject = { title: "ReconPro.", category: "Financial Technology", subtitle: "Automating Multi-Workbook Transaction Reconciliation | Python, Flask, SQLite & JavaScript", technologies: ["Python", "HTML", "CSS", "JavaScript", "SQLite3"], github: "https://github.com/sibrahim-bot/Reconpro", live: "https://salimrecon.onrender.com", video: reconTesting, front: reconFront };

export const reconSections = [
    { heading: "Project Overview", paras: ["Designed and developed ReconPro, a web-based reconciliation application that automates the comparison of transaction records across multiple Excel workbooks and worksheets.", "The application addresses the operational challenge of manually comparing financial records across different sources, such as bank statements, mobile money statements and internal transaction registers.", "Rather than requiring users to manually search through separate workbooks, ReconPro provides a configurable workspace where users can upload their files, select the sources and identifier columns to compare, run the reconciliation process and download a structured Excel report."] },
    { heading: "The Problem", icon: true, paras: ["Reconciling transactions across multiple financial records can be repetitive and time-consuming, particularly when workbooks contain different worksheet structures, multiple transaction reference columns and large volumes of records.", "Manual comparison also makes it difficult to consistently identify partially matched transactions, duplicate references, conflicting records and transactions that remain unmatched."] },
    { heading: "The Solution", paras: ["Developed a browser-based application that allows users to configure and execute reconciliation across 2–5 entities, with support for multiple worksheets under each entity.", "The application uses selected transaction identifiers to establish relationships between source records. It distinguishes fully matched transactions from partial matches, flags ambiguous or duplicate relationships for manual review, and retains unmatched records and transactions without usable identifiers.", "The system then generates a downloadable Excel management report containing summary results, linked detail sheets, exception records, source-level audit information and charts."], media: [{ type: "video", src: reconTesting, label: "ReconPro testing" }] },
    { heading: "Key Features", bullets: ["Multi-workbook Excel upload and worksheet selection.", "Configurable reconciliation involving two to five entities.", "Multiple worksheets grouped under each reconciliation entity.", "Selection of up to five identifier columns per worksheet.", "Identifier extraction and normalisation.", "Fully matched and partially matched transaction classification.", "Duplicate and ambiguous match detection.", "Separate reporting of unmatched and no-ID transactions.", "Automated Excel reconciliation and management reports.", "Session-based workspaces and browser-based operation."] },
    { heading: "Technology Stack", table: [["Backend development", "Python, Flask"], ["Data processing", "Pandas"], ["Reconciliation storage", "SQLite"], ["Excel processing and reporting", "OpenPyXL"], ["Frontend", "HTML, CSS, JavaScript"], ["Deployment", "Render"], ["Version control", "Git, GitHub"]] },
    { heading: "Development and Implementation", paras: ["Built a modular application that separates workbook ingestion, identifier normalisation, matching logic and report generation.", "Developed the Flask backend to manage file uploads, configuration validation, session workspaces and execution of the reconciliation pipeline. Integrated the frontend with the backend through API requests to create a complete upload-to-report workflow.", "Implemented a conflict-aware matching process that groups source records using shared identifiers and flags ambiguous relationships instead of automatically selecting potentially incorrect matches.", "The application was subsequently deployed to Render and made accessible through a live web interface."] },
    { heading: "Project Outcome", paras: ["Delivered a working reconciliation web application that transforms a multi-workbook comparison process into a structured and repeatable workflow.", "The project demonstrates practical software development and problem-solving capabilities, including backend development, data processing, database integration, frontend/backend communication, Excel automation, application testing and cloud deployment.", "Core competencies demonstrated: Python Development | Flask Web Applications | Data Processing | SQLite | Excel Automation | Reconciliation Logic | API Integration | JavaScript | Git & GitHub | Cloud Deployment", "Current matching is based on configured identifiers. Date and amount validation, fuzzy matching, persistent cloud storage and user authentication remain potential future enhancements."] },
]


// WEB APP DEVELOPMENT PROJECTS
export const webAppProjects = [
    featuredProject,
    {
        id: "finance-dashboard-demo",
        title: "Finance Dashboard Demo",
        category: "Web Application",
        front: riskFront,
        demo: true,
    },
    {
        id: "ecommerce-platform-demo",
        title: "E-Commerce Platform Demo",
        category: "Web Application",
        front: boatFront,
        demo: true,
    },
];

// WEBSITE DEVELOPMENT PROJECTS
export const websiteProjects = [
    {
        id: "salim-portfolio",
        title: "Salim Ibrahim Portfolio",
        category: "Website Development",
        subtitle: "Personal Portfolio Website | React, Tailwind CSS and Framer Motion",
        front: websiteFront,
        video: websiteWalkthrough,

        overview: "A personal portfolio website designed and developed to present my projects, technical capabilities, professional experience and academic background through an interactive web experience.",

        technologies: [
            "React",
            "JavaScript",
            "Tailwind CSS",
            "Framer Motion",
            "Lucide React"
        ],

        features: [
            "Interactive project showcases and project detail views.",
            "Animated transitions and interactive visual components.",
            "Dedicated sections for skills, experience, education and certifications.",
            "Responsive layouts for different screen sizes.",
            "Downloadable CV and contact links."
        ],

        contribution: [
            "Designed and developed the portfolio using React.",
            "Built reusable components and structured the website into dedicated pages.",
            "Implemented animations, interactive project showcases and responsive layouts."
        ],

        challenges: [
            "Organising a growing portfolio into reusable components while keeping the code maintainable.",
            "Creating smooth animations and interactive project showcases without compromising usability.",
            "Ensuring consistent layouts and responsiveness across different screen sizes."
        ],
    },
    {
        id: "cafe-website-demo",
        title: "Café Website Demo",
        category: "Website Development",
        front: cafeFront,
        demo: true,
    },
    {
        id: "nike-website-demo",
        title: "Nike Storefront Demo",
        category: "Website Development",
        front: nikeFront,
        demo: true,
    },
];

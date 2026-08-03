# Formatting review fixture: comments and values must remain semantically intact.
qc_threshold<-20
review_cells<-subset(cell_qc,mito_percent>qc_threshold)
review_summary<-data.frame(cells=nrow(review_cells),threshold=qc_threshold)
review_summary

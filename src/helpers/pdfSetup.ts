import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as pdfMake from "pdfmake/build/pdfmake";
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

export default pdfMake.createPdf;

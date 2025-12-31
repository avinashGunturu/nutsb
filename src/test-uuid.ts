
import { v4 } from 'uuid';
try {
    console.log("UUID:", v4());
    console.log("Success");
} catch (e) {
    console.error(e);
    process.exit(1);
}

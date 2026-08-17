import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt();
        for(int i=0;i<t;i++){
            int n = sc.nextInt();
            String str = sc.next();
            int output = 0;
            if(str.contains("...")){ System.out.println("2"); continue; }
            for(char ch: str.toCharArray()) if(ch == '.') output++;
            System.out.println(output);
        }
    }
}